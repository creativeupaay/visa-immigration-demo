import mongoose, { Schema, Document } from "mongoose";
import { aimaStatusEnum, paymentStatus } from "../types/enums/enums";

// 1. TypeScript Interface
export interface IDubaiPayment extends Document {
  amount: number | null;
  currency: string | null;
  paymentMethod: string | null;
  status: paymentStatus;
  paymentLink: string | null;
  invoiceUrl: string | null;
  paymentIntentId: string | null;
  stepStatusId: mongoose.Schema.Types.ObjectId;
}

// 2. Mongoose Schema
const DubaiPaymentSchema: Schema = new Schema({
  amount: { type: Number, default: null },
  currency: { type: String, enum: ["inr", "usd", "eur"], default: null },
  paymentMethod: { type: String, default: null },
  status: {
    type: String,
    enum: Object.values(paymentStatus),
    required: true,
  },
  paymentLink: { type: String , default : null },
  invoiceUrl: { type: String, default: null },
  paymentIntentId: { type: String, default: null },

  stepStatusId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "VisaApplicationStepStatus",
    required: true,
    unique: true,
  },
});

// 3. Mongoose Model
export const dubaiPaymentModel = mongoose.model<IDubaiPayment>(
  "dubaiPayment",
  DubaiPaymentSchema
);
