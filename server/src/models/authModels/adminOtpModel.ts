import mongoose, { Document, Schema } from "mongoose";

export interface IAdminOtp extends Document {
  creatorEmail: string;
  otp: string;
  expiresAt: Date;
  verified: boolean;
}

const AdminOtpSchema = new Schema<IAdminOtp>(
  {
    creatorEmail: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, 
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const AdminOtpModel = mongoose.model<IAdminOtp>("AdminOtp", AdminOtpSchema);
