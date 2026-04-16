
// import mongoose, { Document, Schema } from "mongoose";

// export interface IDominicaGrenadaForm extends Document {
//     formId: string;

//     fullName: {
//         first: string;
//         last: string;
//     };
//     nationality: string;
//     email: string;
//     phone: string;

//     profession: 
//         | "Business Owner / Entrepreneur"
//         | "Investor"
//         | "High-Net-Worth Individual (HNWIs)"
//         | "Employee / Professional"
//         | "Other";
        
//     otherProfessionDetail?: string;

//     businessOwner?: {
//         registeredBusiness?: string;
//         annualRevenue?: string;
//         investmentPreference?: string;
//     };

//     investor?: {
//         readyToInvest?: string;
//         investmentRoute?: string;
//     };

//     HNWI?: {
//         totalAssets?: string;
//         citizenshipReason?: string;
//     };

//     employee?: {
//         monthlyIncome?: string;
//         isInvestmentCapitalReady?: string;
//     };

//     mainGoal: 
//         | "Securing second citizenship for travel/business opportunities"
//         | "Exploring residency options instead";

//     budgetRange: 
//         | "$150,000+"
//         | "$100,000 – $150,000"
//         | "Less than $100,000";

//     movingToApply: 
//         | "Yes, I’m ready"
//         | "I’m considering it and need more info"
//         | "No, just exploring options";

//     visaIssues: 
//         | "No, my record is clear"
//         | "Yes, but I can explain"
//         | "Not sure";

//     additionalInfo?: string;

//     event_id: string;
//     timeToSubmit: number;
// }




// // This is model/schema
// const DominicaGrenadaSchema: Schema = new mongoose.Schema({
//     formId: { type: String, required: true },

//     fullName: {
//         first: { type: String, required: true },
//         last: { type: String, required: true }
//     },
//     nationality: { type: String, required: true },
//     email: { type: String, required: true },
//     phone: { type: String, required: true },

//     profession: {
//         type: String,
//         enum: [
//             "Business Owner / Entrepreneur",
//             "Investor",
//             "High-Net-Worth Individual (HNWIs)",
//             "Employee / Professional",
//             "Other"
//         ],
//         required: true
//     },

//     otherProfessionDetail: { type: String, default: null },

//     businessOwner: {
//         registeredBusiness: {
//             type: String,
//             enum: [
//                 "Yes, and it has consistent revenue",
//                 "Yes, but revenue is inconsistent",
//                 "No, I do not own a business"
//             ],
//             default: null
//         },
//         annualRevenue: {
//             type: String,
//             enum: ["$250,000+", "$100,000 – $250,000", "Less than $100,000"],
//             default: null
//         },
//         investmentPreference: {
//             type: String,
//             enum: [
//                 "Yes, I prefer real estate",
//                 "Yes, I prefer the government donation",
//                 "Not sure yet, I need more guidance"
//             ],
//             default: null
//         }
//     },

//     investor: {
//         readyToInvest: {
//             type: String,
//             enum: [
//                 "Yes, I have at least $150,000 available",
//                 "I need financing options",
//                 "No, I do not have the funds"
//             ],
//             default: null
//         },
//         investmentRoute: {
//             type: String,
//             enum: [
//                 "Government Fund Contribution ($100,000+)",
//                 "Real Estate Investment ($200,000+)",
//                 "Not sure yet, exploring options"
//             ],
//             default: null
//         }
//     },

//     HNWI: {
//         totalAssets: {
//             type: String,
//             enum: ["$250,000+", "$150,000 – $250,000", "Less than $150,000"],
//             default: null
//         },
//         citizenshipReason: {
//             type: String,
//             enum: ["Investment", "Personal Relocation", "Not sure yet"],
//             default: null
//         }
//     },

//     employee: {
//         monthlyIncome: {
//             type: String,
//             enum: ["$10,000+/month", "$5,000 – $10,000", "Less than $5,000"],
//             default: null
//         },
//         isInvestmentCapitalReady: {
//             type: String,
//             enum: [
//                 "Yes, I have at least $150,000",
//                 "I need financing options",
//                 "No, I do not have the funds"
//             ],
//             default: null
//         }
//     },

//     mainGoal: {
//         type: String,
//         enum: [
//             "Securing second citizenship for travel/business opportunities",
//             "Exploring residency options instead"
//         ],
//         required: true
//     },

//     budgetRange: {
//         type: String,
//         enum: ["$150,000+", "$100,000 – $150,000", "Less than $100,000"],
//         required: true
//     },

//     movingToApply: {
//         type: String,
//         enum: [
//             "Yes, I’m ready",
//             "I’m considering it and need more info",
//             "No, just exploring options"
//         ],
//         required: true
//     },

//     visaIssues: {
//         type: String,
//         enum: ["No, my record is clear", "Yes, but I can explain", "Not sure"],
//         required: true
//     },

//     additionalInfo: { type: String, default: null },

//     event_id: { type: String, required: true },
//     timeToSubmit: { type: Number, required: true }
// });

// export default mongoose.model<IDominicaGrenadaForm>(
//     "DominicaGrenadaForm",
//     DominicaGrenadaSchema
// );
