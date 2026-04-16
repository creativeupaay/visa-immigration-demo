import express, { Request, Response } from "express";
import mongoose, { Schema, Document, Types } from "mongoose";
import dotenv from "dotenv";
import morgan from "morgan";
// import helmet from "helmet";
import cors from "cors";
import path from "path";
import connectDB from "./config/db";
import v1Routes from "./routes/v1/index";
import errorHandlerMiddleware from "./middlewares/errorHandler";
import notFoundMiddleware from "./middlewares/notFound";
import cookieParser from "cookie-parser";
import logger from "./utils/logger";
import bodyParser from "body-parser";
import multer from "multer";
import { stripeWebhookHandler } from "./controllers/Leads/paymentController";
import asyncHandler from "./utils/asyncHandler";
// leadMOdel
import { LeadModel } from "./leadModels/leadModel";
import { LeadDomiGrenaModel } from "./leadModels/domiGrenaModel";
import { LeadGrenadaModel } from "./leadModels/grenadaModel";
import { LeadDominicaModel } from "./leadModels/dominicaModel";
import { LeadPortugalModel } from "./leadModels/portugalModel";
import { LeadDubaiModel } from "./leadModels/dubaiModel";
// priority enum
import { leadPriority, leadStatus } from "./types/enums/enums";
// import parsing/ mapping function
import { parseDomiGrenaData } from "./parsingFunctions/domiGrenaParse";
import { parseDubaiData } from "./parsingFunctions/dubaiParse";
import { parsePortugalData } from "./parsingFunctions/portugalParse";
import { getPortugalPriority } from "./priorityFunctions/portugalPriority";
import { getDubaiPriority } from "./priorityFunctions/dubaiPriority";
import { getDomiGrenaPriority } from "./priorityFunctions/domiGrena";
import { sendHighPriorityLeadEmail } from "./services/emails/triggers/leads/eligibility-form-filled/highPriority";
import { sendMediumPriorityLeadEmail } from "./services/emails/triggers/leads/eligibility-form-filled/mediumPriority";
import { sendLowPriorityLeadEmail } from "./services/emails/triggers/leads/eligibility-form-filled/lowPriority";
import { leadEmailToAdmin } from "./services/emails/triggers/admin/eligibility-form-filled/priorityTrigger";
import {
  assignDefaultLead,
  assignDefaultVisaApplication,
} from "./utils/defaultTaskAssign";
import {
  JOTFORM_ID_DOMINICA_GRENADA,
  JOTFORM_ID_DUBAI,
  JOTFORM_ID_PORTUGAL,
} from "./utils/jotformIds";

import { logLeadCame } from "./services/logs/triggers/leadLogs/lead/leadCame";

dotenv.config();

connectDB();

const app = express();

const morganFormat = ":method :url :status :response-time ms";
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => {
        const logObject = {
          method: message.split(" ")[0],
          url: message.split(" ")[1],
          status: message.split(" ")[2],
          responseTime: message.split(" ")[3],
        };
        logger.info(JSON.stringify(logObject));
      },
    },
  })
);

// app.use(helmet());

const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Disposition", "Content-Length"],
};

app.use(cors(corsOptions));
app.use(cookieParser());

// register stripe webhook route  before bodyparser middleware
app.post(
  "/api/v1/admin/payment/webhook/stripe",
  express.raw({ type: "application/json" }),
  asyncHandler(stripeWebhookHandler)
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/v1", v1Routes);

const upload = multer({ storage: multer.memoryStorage() });

app.get("/health", (req: Request, res: Response): void => {
  logger.info("Health check endpoint hit");
  res.json({ status: "ok" });
});

const FORM_ID_MAP: Record<string, (data: any) => any> = {
  [JOTFORM_ID_PORTUGAL]: parsePortugalData,
  [JOTFORM_ID_DUBAI]: parseDubaiData,
  [JOTFORM_ID_DOMINICA_GRENADA]: parseDomiGrenaData,
};

const PRIORITY_MAP: Record<string, (data: any) => leadPriority> = {
  [JOTFORM_ID_PORTUGAL]: getPortugalPriority,
  [JOTFORM_ID_DUBAI]: getDubaiPriority,
  [JOTFORM_ID_DOMINICA_GRENADA]: getDomiGrenaPriority,
};

// webhook endpoint

app.post(
  "/api/v1/webhook",
  upload.any(),
  async (req: Request, res: Response): Promise<void> => {
    logger.info("Webhook endpoint hit");
    logger.info("Raw incoming data: " + JSON.stringify(req.body, null, 2));

    const { formID, rawRequest } = req.body;

    if (!rawRequest || typeof rawRequest !== "string") {
      logger.error("rawRequest is missing or not a string");
      res
        .status(400)
        .json({ status: "error", message: "Invalid or missing rawRequest" });
      return;
    }

    let formData;
    try {
      formData = JSON.parse(rawRequest);
    } catch (error: any) {
      logger.error(`Failed to parse rawRequest: ${error.message}`);
      res
        .status(400)
        .json({ status: "error", message: "Invalid rawRequest data" });
      return;
    }

    // Step 1: Parse the form data
    const parser = FORM_ID_MAP[formID];
    if (!parser) {
      logger.warn(`No parser found for formID: ${formID}`);
      res.status(400).json({ status: "error", message: "Unrecognized formID" });
      return;
    }

    const parsedData = parser(formData);
    logger.info(
      `Parsed data for formID ${formID}: ${JSON.stringify(parsedData, null, 2)}`
    );

    // Step 2: Get priority from form-specific priority function
    const priorityFn = PRIORITY_MAP[formID];
    if (!priorityFn) {
      logger.warn(`No priority function found for formID: ${formID}`);
      res
        .status(400)
        .json({ status: "error", message: "Priority function not defined" });
      return;
    }

    const priority = priorityFn(parsedData);
    logger.info(`Calculated priority: ${priority}`);

    // Step 3: Extract common + additional fields
    const { formId, fullName, email, phone, nationality, ...rest } = parsedData;

    const commonFields = {
      formId,
      fullName,
      email,
      phone,
      nationality,
    };

    const additionalInfo = {
      ...rest,
      priority,
    };

    // Step 4: Create lead (discriminator model will handle the right schema)
    let serviceType = "";

    try {
      let LeadModelToUse;

      switch (formID) {
        case JOTFORM_ID_PORTUGAL:
          LeadModelToUse = LeadPortugalModel;
          serviceType = "Portugal D7 Visa";
          break;
        case JOTFORM_ID_DUBAI:
          LeadModelToUse = LeadDubaiModel;
          serviceType = "Dubai Business Setup";
          break;
        // case "250912364956463":
        //   LeadModelToUse = LeadDomiGrenaModel;
        //   break;
        case JOTFORM_ID_DOMINICA_GRENADA:
          // Check visaType inside parsed data
          if (parsedData.visaTypeName === "DOMINICA") {
            LeadModelToUse = LeadDominicaModel;
            serviceType = "Dominica Passport";
          } else if (parsedData.visaTypeName === "GRENADA") {
            LeadModelToUse = LeadGrenadaModel;
            serviceType = "Grenada Passport";
          } else {
            res.status(400).json({
              status: "error",
              message: "Unknown visa type in form data",
            });
            return;
          }
          break;

        default:
          res
            .status(400)
            .json({ status: "error", message: "Unsupported formID" });
          return;
      }

      const newLead = new LeadModelToUse({
        ...commonFields,
        leadStatus: leadStatus.INITIATED,
        additionalInfo,
      });

      await newLead.save();

      assignDefaultLead(newLead._id as mongoose.Types.ObjectId);

      const calendlyLink = `${process.env.CALENDLY_LINK}?utm_campaign=${newLead._id}&utm_source=EEE360`;

      await leadEmailToAdmin(
        newLead.fullName.split(" ")[0],
        serviceType,
        priority
      );
      if (priority === leadPriority.HIGH) {
        await sendHighPriorityLeadEmail(
          newLead.email,
          newLead.fullName.split(" ")[0],
          serviceType,
          calendlyLink
        );
      } else if (priority === leadPriority.MEDIUM) {
        await sendMediumPriorityLeadEmail(
          newLead.email,
          newLead.fullName.split(" ")[0],
          serviceType,
          calendlyLink
        );
      } else if (priority === leadPriority.LOW) {
        await sendLowPriorityLeadEmail(
          newLead.email,
          newLead.fullName.split(" ")[0],
          serviceType,
          "",
          ""
        );
      }
      logger.info("Lead saved successfully :", newLead);

      // Add log (logLeadCame)
      await logLeadCame({ priority: priority, leadName: `${newLead.fullName}`, doneBy: newLead.fullName, leadId: newLead._id as mongoose.Types.ObjectId });


      res.status(200).json({ status: "success", message: "Lead saved to DB" });
      return;
    } catch (error: any) {
      logger.error("Error saving lead: " + error.message);
      res.status(500).json({ status: "error", message: "Failed to save lead" });
      return;
    }
  }
);

if (process.env.NODE_ENV === "production") {
  const buildPath = path.join(__dirname, "..", "..", "client", "dist");
  app.use(express.static(buildPath));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(buildPath, "index.html"));
  });
}

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const args = process.argv.slice(2);
const portArgIndex = args.indexOf("--port");
const PORT =
  portArgIndex !== -1
    ? Number(args[portArgIndex + 1])
    : Number(process.env.PORT) || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
