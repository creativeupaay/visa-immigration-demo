import mongoose, { Schema, Document } from "mongoose";

// 1. TypeScript Interface
export interface IDgBankDetails extends Document {
  visaTypeName: "DOMINICA" | "GRENADA";
  bankName: string;
  accountHolderName: string;
  accountNumber: string; //  recommended
  swiftOrBicCode: string;
  ibanNumber: string | null;
  ifscCode: string;
}

// 2. Mongoose Schema
const dgBankDetailsSchema: Schema = new Schema(
  {
    visaTypeName: {
      type: String,
      enum: ["DOMINICA", "GRENADA"],
      required: true,
      unique: true,
    },
    bankName: {
      type: String,
      required: true,
    },
    accountHolderName: {
      type: String,
      required: true,
    },
    accountNumber: {
      type: String,
      required: true,
    },
    swiftOrBicCode: {
      type: String,
      required: true,
    },
    ibanNumber: {
      type: String,
      default: null,
    },
    ifscCode: {
      type: String,
      required: true,
    },
  }
);

// 3. Mongoose Model
export const DgBankDetailsModel = mongoose.model<IDgBankDetails>(
  "DgBankDetails",
  dgBankDetailsSchema
);


