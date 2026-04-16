// interfaces/IDubaiForm.ts
import { Schema, model } from "mongoose";
import { ILead , LeadModel } from "./leadModel";
import {leadPriority} from "../types/enums/enums";

export interface ILeadDubai extends ILead {
  additionalInfo: {

    profession?: 
      | "Business Owner / Entrepreneur"
      | "Freelancer / Remote Worker"
      | "Employee / Professional"
      | "Investor"
      | "Other (please specify)";
    

    businessOwner?: {
      registeredBusiness?: 
        | "Yes, my business is legally registered"
        | "No, but I’ve operated informally"
        | "No, I’m planning to start fresh";
      annualRevenue?: 
        | "Less than $50,000"
        | "$50,000 – $200,000"
        | "$200,000 – $500,000"
        | "$500,000+";
      relocationPlan?: 
        | "Yes, I plan to relocate"
        | "No, I will manage it remotely";
    };

    freelancer?: {
      incomeSource?: 
        | "Independent freelance projects"
        | "Contract-based work with international clients"
        | "Full-time remote job";
      monthlyIncome?: 
        | "Less than $2,500"
        | "$2,500 – $5,000"
        | "$5,000 – $10,000"
        | "$10,000+";
      requriedLicenseType?: 
        | "Freelance Permit"
        | "Full Business License";
    };

    employee?: {
      transitionPlan?: 
        | "Side business alongside my job"
        | "Full transition to self-employment";
      investmentCapital?: 
        | "Yes, I have at least $5,000 – $10,000"
        | "Yes, I have more than $10,000"
        | "No, I need financing options";
    };

    investor?: {
      investmentAmount?: 
        | "Less than $50,000"
        | "$50,000 – $100,000"
        | "$100,000 – $250,000"
        | "$250,000+";
      industryInterest?: 
        | "Yes, I have a targeted industry"
        | "No, I am open to profitable options";
      targetedIndustry?: string;
    };

    other? : {
      otherProfessionDetail ? : String ;
    }

    mainGoal?: (
      | "Expanding my business internationally"
      | "Establishing a new business"
      | "Obtaining a residency visa through business setup"
      | "Investment opportunities in Dubai"
      | "Not sure yet, exploring options"
    )[];

    budgetRange?: 
      | "Less than $5,000"
      | "$5,000 – $10,000"
      | "$10,000 – $30,000"
      | "$30,000+";

    movingToDubai?: 
      | "Yes, I’m ready"
      | "I’m considering it and need more info"
      | "No, just exploring options";

    visaIssues?: 
      | "No, my record is clear"
      | "Yes, but I can explain"
      | "Not sure";

    extraInfo?: string;
    
    priority: leadPriority;
    // event_id: string;


  };
}





// models/DubaiForm.ts
const LeadDubaiSchema = new Schema<ILeadDubai>({
  additionalInfo: {
    visaType: String,
    travelDate: String,
    hasSponsor: Boolean,

    profession: {
      type: String,
      enum: [
        "Business Owner / Entrepreneur",
        "Freelancer / Remote Worker",
        "Employee / Professional",
        "Investor",
        "Other (please specify)",
      ],
    },


    businessOwner: {
      registeredBusiness: {
        type: String,
        enum: [
          "Yes, my business is legally registered",
          "No, but I’ve operated informally",
          "No, I’m planning to start fresh",
        ],
      },
      annualRevenue: {
        type: String,
        enum: [
          "Less than $50,000",
          "$50,000 – $200,000",
          "$200,000 – $500,000",
          "$500,000+",
        ],
      },
      relocationPlan: {
        type: String,
        enum: [
          "Yes, I plan to relocate",
          "No, I will manage it remotely",
        ],
      },
    },

    freelancer: {
      incomeSource: {
        type: String,
        enum: [
          "Independent freelance projects",
          "Contract-based work with international clients",
          "Full-time remote job",
        ],
      },
      monthlyIncome: {
        type: String,
        enum: [
          "Less than $2,500",
          "$2,500 – $5,000",
          "$5,000 – $10,000",
          "$10,000+",
        ],
      },
      requriedLicenseType: {
        type: String,
        enum: [
          "Freelance Permit",
          "Full Business License",
        ],
      },
    },

    employee: {
      transitionPlan: {
        type: String,
        enum: [
          "Side business alongside my job",
          "Full transition to self-employment",
        ],
      },
      investmentCapital: {
        type: String,
        enum: [
          "Yes, I have at least $5,000 – $10,000",
          "Yes, I have more than $10,000",
          "No, I need financing options",
        ],
      },
    },

    investor: {
      investmentAmount: {
        type: String,
        enum: [
          "Less than $50,000",
          "$50,000 – $100,000",
          "$100,000 – $250,000",
          "$250,000+",
        ],
      },
      industryInterest: {
        type: String,
        enum: [
          "Yes, I have a targeted industry",
          "No, I am open to profitable options",
        ],
      },
      targetedIndustry: String,
    },

    other : {
      otherProfessionDetail : {
        type : String , 
        default : null
      }
    },

    mainGoal: {
      type: [String],
      enum: [
        "Expanding my business internationally",
        "Establishing a new business",
        "Obtaining a residency visa through business setup",
        "Investment opportunities in Dubai",
        "Not sure yet, exploring options",
      ],
    },

    budgetRange: {
      type: String,
      enum: [
        "Less than $5,000",
        "$5,000 – $10,000",
        "$10,000 – $30,000",
        "$30,000+",
      ],
    },

    movingToDubai: {
      type: String,
      enum: [
        "Yes, I’m ready",
        "I’m considering it and need more info",
        "No, just exploring options",
      ],
    },

    visaIssues: {
      type: String,
      enum: [
        "No, my record is clear",
        "Yes, but I can explain",
        "Not sure",
      ],
    },

    extraInfo: { type: String, default: null },

    priority: {
      type: String,
      enum: Object.values(leadPriority),
      required: true, // or false, based on your requirement
    },
    // event_id: { type: String, required: true },


  },
});

export const LeadDubaiModel = LeadModel.discriminator<ILeadDubai>(
  "LeadDubai",
  LeadDubaiSchema
);
