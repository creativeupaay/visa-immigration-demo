import { Request, Response } from "express";
import mongoose from "mongoose";
import { LeadDominicaModel } from "../../leadModels/dominicaModel";
import { LeadDubaiModel } from "../../leadModels/dubaiModel";
import { LeadGrenadaModel } from "../../leadModels/grenadaModel";
import { LeadPortugalModel } from "../../leadModels/portugalModel";
import { leadPriority, leadStatus } from "../../types/enums/enums";
import { assignDefaultLead } from "../../utils/defaultTaskAssign";
import { sendHighPriorityLeadEmail } from "../../services/emails/triggers/leads/eligibility-form-filled/highPriority";
import { sendMediumPriorityLeadEmail } from "../../services/emails/triggers/leads/eligibility-form-filled/mediumPriority";
import { sendLowPriorityLeadEmail } from "../../services/emails/triggers/leads/eligibility-form-filled/lowPriority";
import { leadEmailToAdmin } from "../../services/emails/triggers/admin/eligibility-form-filled/priorityTrigger";
import { logLeadCame } from "../../services/logs/triggers/leadLogs/lead/leadCame";

type SupportedVisaType = "PORTUGAL" | "DUBAI" | "DOMINICA" | "GRENADA";

const DEMO_FORM_ID = "INTERNAL_DEMO_FORM";

const SERVICE_TYPE_MAP: Record<SupportedVisaType, string> = {
  PORTUGAL: "Portugal D7 Visa",
  DUBAI: "Dubai Business Setup",
  DOMINICA: "Dominica Passport",
  GRENADA: "Grenada Passport",
};

const MODEL_MAP = {
  PORTUGAL: LeadPortugalModel,
  DUBAI: LeadDubaiModel,
  DOMINICA: LeadDominicaModel,
  GRENADA: LeadGrenadaModel,
} as const;

const normalizePriority = (value: unknown): leadPriority => {
  const upper = String(value ?? "").toUpperCase();
  if (upper === leadPriority.HIGH) return leadPriority.HIGH;
  if (upper === leadPriority.LOW) return leadPriority.LOW;
  return leadPriority.MEDIUM;
};

const getDefaultAdditionalInfo = (
  visaType: SupportedVisaType,
  priority: leadPriority,
  extraInfo?: string
) => {
  if (visaType === "PORTUGAL") {
    return {
      profession: "Business Owner",
      businessOwner: {
        annualRevenue: "€50,000 – €150,000",
        isOneLakhInvestmentAvailable: "Yes",
      },
      incomeSources: ["Salary"],
      monthlyIncomeRange: "€1,000 – €2,000",
      financialStatements: "Yes, complete records",
      sufficientSavingsFor12Months: "Yes, at least €10,000+ in savings",
      legalResidency: "Yes, legally documented",
      otherCitizenship: "No second passport & restricted mobility",
      housingPlan: "Undecided but open to it",
      stayDuration: "More than 183 days per year",
      dependents: "1–4 dependents (with financial means)",
      extraInfo: extraInfo || "Created from in-app public lead capture form",
      priority,
    };
  }

  if (visaType === "DUBAI") {
    return {
      profession: "Investor",
      investor: {
        investmentAmount: "$50,000 – $100,000",
        industryInterest: "No, I am open to profitable options",
      },
      mainGoal: ["Not sure yet, exploring options"],
      budgetRange: "$10,000 – $30,000",
      movingToDubai: "I’m considering it and need more info",
      visaIssues: "No, my record is clear",
      extraInfo: extraInfo || "Created from in-app public lead capture form",
      priority,
    };
  }

  return {
    profession: "Investor",
    investor: {
      readyToInvest: "Yes, I have at least $150,000 available",
      investmentRoute: "Government Fund Contribution ($100,000+)",
    },
    mainGoal: "Securing second citizenship for travel/business opportunities",
    budgetRange: "$150,000+",
    movingToApply: "I’m considering it and need more info",
    visaIssues: "No, my record is clear",
    extraInfo: extraInfo || "Created from in-app public lead capture form",
    priority,
  };
};

export const createDemoLead = async (req: Request, res: Response) => {
  const {
    visaType,
    fullName,
    email,
    phone,
    nationality,
    priority,
    extraInfo,
  } = req.body ?? {};

  const normalizedVisaType = String(visaType ?? "").toUpperCase() as SupportedVisaType;

  if (!MODEL_MAP[normalizedVisaType]) {
    return res.status(400).json({
      success: false,
      message: "Invalid visa type. Use PORTUGAL, DUBAI, DOMINICA, or GRENADA.",
    });
  }

  if (!fullName || !email || !phone || !nationality) {
    return res.status(400).json({
      success: false,
      message: "fullName, email, phone, and nationality are required.",
    });
  }

  const normalizedPriority = normalizePriority(priority);
  const LeadModelToUse = MODEL_MAP[normalizedVisaType];
  const serviceType = SERVICE_TYPE_MAP[normalizedVisaType];

  const additionalInfo = getDefaultAdditionalInfo(
    normalizedVisaType,
    normalizedPriority,
    extraInfo
  );

  const newLead = new LeadModelToUse({
    formId: DEMO_FORM_ID,
    fullName,
    email,
    phone,
    nationality,
    leadStatus: leadStatus.INITIATED,
    additionalInfo,
  });

  await newLead.save();

  const calendlyLink = `${process.env.CALENDLY_LINK}?utm_campaign=${newLead._id}&utm_source=VISADEMO`;

  const asyncSideEffects: Promise<unknown>[] = [
    leadEmailToAdmin(newLead.fullName.split(" ")[0], serviceType, normalizedPriority),
    logLeadCame({
      priority: normalizedPriority,
      leadName: newLead.fullName,
      doneBy: newLead.fullName,
      leadId: newLead._id as mongoose.Types.ObjectId,
    }),
  ];

  if (normalizedPriority === leadPriority.HIGH) {
    asyncSideEffects.push(
      sendHighPriorityLeadEmail(
        newLead.email,
        newLead.fullName.split(" ")[0],
        serviceType,
        calendlyLink
      )
    );
  } else if (normalizedPriority === leadPriority.MEDIUM) {
    asyncSideEffects.push(
      sendMediumPriorityLeadEmail(
        newLead.email,
        newLead.fullName.split(" ")[0],
        serviceType,
        calendlyLink
      )
    );
  } else {
    asyncSideEffects.push(
      sendLowPriorityLeadEmail(
        newLead.email,
        newLead.fullName.split(" ")[0],
        serviceType,
        "",
        ""
      )
    );
  }

  // Keep lead creation successful in demo even if notifications/log side-effects fail.
  Promise.allSettled(asyncSideEffects).catch(() => undefined);
  assignDefaultLead(newLead._id as mongoose.Types.ObjectId).catch(() => undefined);

  return res.status(201).json({
    success: true,
    message: "Demo lead created successfully",
    data: {
      leadId: newLead._id,
      nanoLeadId: newLead.nanoLeadId,
      visaType: normalizedVisaType,
      priority: normalizedPriority,
      calendlyLink,
    },
  });
};
