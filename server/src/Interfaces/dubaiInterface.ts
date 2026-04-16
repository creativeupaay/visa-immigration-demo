// import mongoose, { Schema, Document } from "mongoose";

// // Interface
// export interface IDubaiApplication extends Document {
//   formId: string;
//   fullName: {
//     first: string;
//     last: string;
//   };
//   nationality: string;
//   email: string;
//   phone: string;
//   profession:
//     | "Business Owner / Entrepreneur"
//     | "Freelancer / Remote Worker"
//     | "Employee / Professional"
//     | "Investor"
//     | "Other (please specify)";
//   otherProfessionDetail?: string;

//   businessOwner?: {
//     registeredBusiness?:
//       | "Yes, my business is legally registered"
//       | "No, but I’ve operated informally"
//       | "No, I’m planning to start fresh";
//     annualRevenue?:
//       | "Less than $50,000"
//       | "$50,000 – $200,000"
//       | "$200,000 – $500,000"
//       | "$500,000+";
//     relocationPlan?:
//       | "Yes, I plan to relocate"
//       | "No, I will manage it remotely";
//   };

//   freelancer?: {
//     incomeSource?:
//       | "Independent freelance projects"
//       | "Contract-based work with international clients"
//       | "Full-time remote job";
//     monthlyIncome?:
//       | "Less than $2,500"
//       | "$2,500 – $5,000"
//       | "$5,000 – $10,000"
//       | "$10,000+";
//     requriedLicenseType?:
//       | "Freelance Permit"
//       | "Full Business License";
//   };

//   employee?: {
//     transitionPlan?:
//       | "Side business alongside my job"
//       | "Full transition to self-employment";
//     investmentCapital?:
//       | "Yes, I have at least $5,000 – $10,000"
//       | "Yes, I have more than $10,000"
//       | "No, I need financing options";
//   };

//   investor?: {
//     investmentAmount?:
//       | "Less than $50,000"
//       | "$50,000 – $100,000"
//       | "$100,000 – $250,000"
//       | "$250,000+";
//     industryInterest?:
//       | "Yes, I have a targeted industry"
//       | "No, I am open to profitable options";
//     targetedIndustry?: string;
//   };

//   mainGoal: (
//     | "Expanding my business internationally"
//     | "Establishing a new business"
//     | "Obtaining a residency visa through business setup"
//     | "Investment opportunities in Dubai"
//     | "Not sure yet, exploring options"
//   )[];

//   budgetRange?:
//     | "Less than $5,000"
//     | "$5,000 – $10,000"
//     | "$10,000 – $30,000"
//     | "$30,000+";

//   movingToDubai?:
//     | "Yes, I’m ready"
//     | "I’m considering it and need more info"
//     | "No, just exploring options";

//   visaIssues?:
//     | "No, my record is clear"
//     | "Yes, but I can explain"
//     | "Not sure";

//   additionalInfo?: string;
// }



// // Schema
// const DubaiApplicationSchema: Schema = new Schema(
//   {
//     formId: { type: String, required: true },
//     fullName: {
//       first: { type: String, required: true },
//       last: { type: String, required: true }
//     },
//     nationality: { type: String, required: true },
//     email: { type: String, required: true },
//     phone: { type: String, required: true },
//     profession: {
//       type: String,
//       required: true,
//       enum: [
//         "Business Owner / Entrepreneur",
//         "Freelancer / Remote Worker",
//         "Employee / Professional",
//         "Investor",
//         "Other (please specify)"
//       ]
//     },
//     otherProfessionDetail: { type: String },

//     businessOwner: {
//       registeredBusiness: {
//         type: String,
//         enum: [
//           "Yes, my business is legally registered",
//           "No, but I’ve operated informally",
//           "No, I’m planning to start fresh"
//         ]
//       },
//       annualRevenue: {
//         type: String,
//         enum: [
//           "Less than $50,000",
//           "$50,000 – $200,000",
//           "$200,000 – $500,000",
//           "$500,000+"
//         ]
//       },
//       relocationPlan: {
//         type: String,
//         enum: [
//           "Yes, I plan to relocate",
//           "No, I will manage it remotely"
//         ]
//       }
//     },

//     freelancer: {
//       incomeSource: {
//         type: String,
//         enum: [
//           "Independent freelance projects",
//           "Contract-based work with international clients",
//           "Full-time remote job"
//         ]
//       },
//       monthlyIncome: {
//         type: String,
//         enum: [
//           "Less than $2,500",
//           "$2,500 – $5,000",
//           "$5,000 – $10,000",
//           "$10,000+"
//         ]
//       },
//       requriedLicenseType: {
//         type: String,
//         enum: [
//           "Freelance Permit",
//           "Full Business License"
//         ]
//       }
//     },

//     employee: {
//       transitionPlan: {
//         type: String,
//         enum: [
//           "Side business alongside my job",
//           "Full transition to self-employment"
//         ]
//       },
//       investmentCapital: {
//         type: String,
//         enum: [
//           "Yes, I have at least $5,000 – $10,000",
//           "Yes, I have more than $10,000",
//           "No, I need financing options"
//         ]
//       }
//     },

//     investor: {
//       investmentAmount: {
//         type: String,
//         enum: [
//           "Less than $50,000",
//           "$50,000 – $100,000",
//           "$100,000 – $250,000",
//           "$250,000+"
//         ]
//       },
//       industryInterest: {
//         type: String,
//         enum: [
//           "Yes, I have a targeted industry",
//           "No, I am open to profitable options"
//         ]
//       },
//       targetedIndustry: { type: String }
//     },

//     mainGoal: {
//       type: [String],
//       enum: [
//         "Expanding my business internationally",
//         "Establishing a new business",
//         "Obtaining a residency visa through business setup",
//         "Investment opportunities in Dubai",
//         "Not sure yet, exploring options"
//       ]
//     },

//     budgetRange: {
//       type: String,
//       enum: [
//         "Less than $5,000",
//         "$5,000 – $10,000",
//         "$10,000 – $30,000",
//         "$30,000+"
//       ]
//     },

//     movingToDubai: {
//       type: String,
//       enum: [
//         "Yes, I’m ready",
//         "I’m considering it and need more info",
//         "No, just exploring options"
//       ]
//     },

//     visaIssues: {
//       type: String,
//       enum: [
//         "No, my record is clear",
//         "Yes, but I can explain",
//         "Not sure"
//       ]
//     },

//     additionalInfo: { type: String }
//   },
//   {
//     timestamps: true
//   }
// );

// export const DubaiApplicationModel = mongoose.model<IDubaiApplication>(
//   "DubaiApplication",
//   DubaiApplicationSchema
// );


// second webhook logic
// app.post("/api/v1/webhook", upload.any(), async (req: Request, res: Response): Promise<void> => {
//   logger.info("Webhook endpoint hit");
//   logger.info("Raw incoming data: " + JSON.stringify(req.body, null, 2));

//   const { formID, rawRequest } = req.body;

//   if (!rawRequest || typeof rawRequest !== "string") {
//     logger.error("rawRequest is missing or not a string");
//     res.status(400).json({ status: "error", message: "Invalid or missing rawRequest" });
//     return;
//   }

//   let formData;
//   try {
//     formData = JSON.parse(rawRequest);
//   } catch (error: any) {
//     logger.error(`Failed to parse rawRequest: ${error.message}`);
//     res.status(400).json({ status: "error", message: "Invalid rawRequest data" });
//     return;
//   }

//   const parser = FORM_ID_MAP[formID];
//   const getPriority = PRIORITY_MAP[formID];

//   if (!parser || !getPriority) {
//     logger.warn(`No parser or priority function found for formID: ${formID}`);
//     res.status(400).json({ status: "error", message: "Unrecognized formID" });
//     return;
//   }

//   const parsedData = parser(formData);
//   logger.info(`Parsed data: ${JSON.stringify(parsedData, null, 2)}`);

//   const priority = getPriority(parsedData);
//   logger.info(`Calculated priority: ${priority}`);

//   // Construct the lead data
//   const leadData = {
//     ...parsedData,
//     priority,
//   };

//   try {
//     const newLead = new LeadModel(leadData); // Automatically uses discriminator if needed
//     await newLead.save();
//     logger.info(`Lead saved successfully with ID: ${newLead._id}`);
//     res.status(201).json({ status: "success", message: "Lead created", data: newLead });
//   } catch (error: any) {
//     logger.error(`Error saving lead: ${error.message}`);
//     res.status(500).json({ status: "error", message: "Failed to save lead" });
//   }
// });



