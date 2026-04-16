// models/DgShipping.ts
import mongoose, { Schema, Document } from 'mongoose';

interface SupportInfo {
  email: string;
  phoneNo: string;
}

export interface IDgShipping extends Document {
  courierService: string;
  trackingNo: string;
  trackingUrl: string;
  supportInfo: SupportInfo;

  stepStatusId: mongoose.Schema.Types.ObjectId;
}

const DgShippingSchema: Schema = new Schema(
  {
    courierService: { type: String, required: true },
    trackingNo: { type: String, required: true },
    trackingUrl: { type: String, required: true },
    supportInfo: {
      email: { type: String, required: true },
      phoneNo: { type: String, required: true },
    },
    stepStatusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VisaApplicationStepStatus',
      required: true,
      unique : true 
    }
  }
);

export const DgShippingModel = mongoose.model<IDgShipping>(
    "DgShipping",
    DgShippingSchema
  );
