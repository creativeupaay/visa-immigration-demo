import mongoose, { Schema, Document } from "mongoose";

// 1. TypeScript Interface
export interface IDgDelivery extends Document {
    fullName: string;
    email: string;
    phoneNo: string; //recommended
    alternativePhoneNo: string;
    address: string;
    city: string;
    country: string;
    postalCode: string;

    stepStatusId: mongoose.Schema.Types.ObjectId;
}

// 2. Mongoose Schema
const DgDeliverySchema: Schema = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phoneNo: { type: String, required: true },
    alternativePhoneNo: { type: String , required: true  },
    address: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    postalCode: { type: String, required: true },
    stepStatusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VisaApplicationStepStatus',
      required: true,
      unique : true 
    }
  }
);

// 3. Mongoose Model
export const DgDeliveryModel = mongoose.model<IDgDelivery>(
  "DgDelivery",
  DgDeliverySchema
);


