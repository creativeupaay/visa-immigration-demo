// import { NextFunction, Request, Response } from "express";
// import AppError from "../../utils/appError";
// // import multer from "multer";
// import logger from "../../utils/logger";

// import { parseDomiGrenaData } from "../../parsingFunctions/domiGrenaParse"
// import { parseDubaiData } from "../../parsingFunctions/dubaiParse"
// import { parsePortugalData } from "../../parsingFunctions/portugalParse"

// import { LeadModel } from "../../leadModels/leadModel";
// import { LeadDomiGrenaModel } from "../../leadModels/domiGrenaModel";
// import { LeadPortugalModel } from "../../leadModels/portugalModel";
// import { LeadDubaiModel } from "../../leadModels/dubaiModel";

// import {leadPriority , leadStatus} from "../../types/enums/enums";

// import {getPortugalPriority , getDubaiPriority , getDomiGrenaPriority} from "../../utils/priority"



// // const upload = multer({ storage: multer.memoryStorage() });


// const FORM_ID_MAP: Record<string, (data: any) => any> = {
//     "250912382847462": parsePortugalData,
//     "250901425096454": parseDubaiData,
//     "250912364956463": parseDomiGrenaData,
// };
  
  
// const PRIORITY_MAP: Record<string, (data: any) => leadPriority> = {
//     "250912382847462": getPortugalPriority,
//     "250901425096454": getDubaiPriority,
//     "250912364956463": getDomiGrenaPriority,
// };

// export const jotFormWebhook = async (req: Request, res: Response): Promise<void> => {

//     logger.info("Webhook endpoint hit");
//   logger.info("Raw incoming data: " + JSON.stringify(req.body, null, 2));

//   const { formID, rawRequest } = req.body;

//   if (!rawRequest || typeof rawRequest !== "string") {
//     logger.error("rawRequest is missing or not a string");
//      res.status(400).json({ status: "error", message: "Invalid or missing rawRequest" });
//      return;
//   }

//   let formData;
//   try {
//     formData = JSON.parse(rawRequest);
//   } catch (error: any) {
//     logger.error(`Failed to parse rawRequest: ${error.message}`);
//      res.status(400).json({ status: "error", message: "Invalid rawRequest data" });
//      return;
//   }

//   // Step 1: Parse the form data
//   const parser = FORM_ID_MAP[formID];
//   if (!parser) {
//     logger.warn(`No parser found for formID: ${formID}`);
//      res.status(400).json({ status: "error", message: "Unrecognized formID" });
//      return;
//   }

//   const parsedData = parser(formData);
//   logger.info(`Parsed data for formID ${formID}: ${JSON.stringify(parsedData, null, 2)}`);

//   // Step 2: Get priority from form-specific priority function
//   const priorityFn = PRIORITY_MAP[formID];
//   if (!priorityFn) {
//     logger.warn(`No priority function found for formID: ${formID}`);
//      res.status(400).json({ status: "error", message: "Priority function not defined" });
//      return;
//   }

//   const priority = priorityFn(parsedData);
//   logger.info(`Calculated priority: ${priority}`);

//   // Step 3: Extract common + additional fields
//   const {
//     formId,
//     fullName,
//     email,
//     phone,
//     nationality,
//     ...rest
//   } = parsedData;

//   const commonFields = {
//     formId,
//     fullName,
//     email,
//     phone,
//     nationality
//   };

//   const additionalInfo = {
//     ...rest,
//     priority
//   };

//   // Step 4: Create lead (discriminator model will handle the right schema)
//   try {
//     let LeadModelToUse;

//     switch (formID) {
//       case "250912382847462":
//         LeadModelToUse = LeadPortugalModel;
//         break;
//       case "250901425096454":
//         LeadModelToUse = LeadDubaiModel;
//         break;
//       case "250912364956463":
//         LeadModelToUse = LeadDomiGrenaModel;
//         break;
//       default:
//          res.status(400).json({ status: "error", message: "Unsupported formID" });
//          return;
//     }

//     const newLead = new LeadModelToUse({
//       ...commonFields,
//       leadStatus: leadStatus.INITIATED,
//       additionalInfo ,
//     });

//     await newLead.save();

//     logger.info("Lead saved successfully");
//      res.status(200).json({ status: "success", message: "Lead saved to DB" });
//      return;
//   } catch (error: any) {
//     logger.error("Error saving lead: " + error.message);
//      res.status(500).json({ status: "error", message: "Failed to save lead" });
//      return;
//   }

// };













