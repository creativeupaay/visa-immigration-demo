import mongoose, { Document, Schema, Model } from 'mongoose';
import { dgInvestStatusEnum , investmentOptionEnum } from "../types/enums/enums";

// 1. TypeScript Interface
export interface IDgInvestment extends Document {
  dgInvestStatus: dgInvestStatusEnum;
  invoiceUrl: string;
  realStateOptions: string[];
  investmentOption: investmentOptionEnum;
  stepStatusId: mongoose.Schema.Types.ObjectId;
}

// 2. Mongoose Schema
const dgInvestmentSchema: Schema = new Schema<IDgInvestment>(
  {   
    dgInvestStatus: {
      type: String,
      enum: Object.values(dgInvestStatusEnum),
      required : true
    },
    invoiceUrl: {
      type: String,
      default : null
    },
    realStateOptions: {
      type: [String],
      default: [],
    },
    investmentOption: {
      type: String,
      enum: Object.values(investmentOptionEnum),
      required: true,
    }, 
    stepStatusId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VisaApplicationStepStatus',
        required: true,
    },
  }

);



export const DgInvestmentModel = mongoose.model<IDgInvestment>(
    "DgInvestment",
    dgInvestmentSchema
);
