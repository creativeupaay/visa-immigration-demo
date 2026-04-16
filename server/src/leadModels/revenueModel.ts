import { Schema, model, Document, models } from "mongoose";
import {  VisaTypeEnum } from "../types/enums/enums";


export interface IRevenueSummary extends Document {
  visaType: VisaTypeEnum;
  totalRevenue: number;
}

const revenueSummarySchema = new Schema<IRevenueSummary>(
  {
    visaType: {
        type: String,
        enum: Object.values(VisaTypeEnum),
        required : true ,
        unique: true,
    },
    totalRevenue: {
      type: Number,
      required : true,
    }
  }
);

export const RevenueModel = model<IRevenueSummary>("RevenueSummary", revenueSummarySchema);