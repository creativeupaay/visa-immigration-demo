import mongoose, { Schema, Document, Types } from "mongoose";
import {
  additionalDocStatusEnum
} from "../types/enums/enums";

export interface IAdditionalDocStatus extends Document {
  docUrl: string;
  status: additionalDocStatusEnum;
  reqId: Types.ObjectId;             
  visaApplicationId: Types.ObjectId; 
}

const AdditionalDocStatusSchema = new Schema<IAdditionalDocStatus>(
  {
    docUrl: { 
      type: String, 
      required: true 
    },

    status: {
      type: String,
      enum: Object.values(additionalDocStatusEnum),
      required:true
    },

    reqId: { 
        type: Schema.Types.ObjectId, 
        required: true, 
        ref: "additionaldocs" 
    } ,

    visaApplicationId: {
        type: Schema.Types.ObjectId,
        ref: "VisaApplication",
        required: true
    }
  },
  { timestamps: true }
);

export const AdditionalDocStatusModel = mongoose.model<IAdditionalDocStatus>(
  "additionaldocstatuses",
  AdditionalDocStatusSchema
);

