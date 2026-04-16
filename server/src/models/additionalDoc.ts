import mongoose, { Schema, Document , Types } from "mongoose";
import {
  reqCategoryEnum,
  additionalDocVisaType
} from "../types/enums/enums"; 

export interface IAdditionalDoc extends Document {
  docName: string;
  categoryId: Types.ObjectId; 
  visaType: additionalDocVisaType;
  required: boolean;
}

const AdditionalDocSchema = new Schema<IAdditionalDoc>(
  {
    docName: { 
      type: String, 
      required: true 
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "doccategories",  
      required: true
    },
    visaType: {
      type: String,
      enum: Object.values(additionalDocVisaType),
      required: true
    },
    required: { 
      type: Boolean, 
      default: false 
    }
  },
  { timestamps: true }
);

export const AdditionalDocModel = mongoose.model<IAdditionalDoc>(
  "additionaldocs",
  AdditionalDocSchema
);
