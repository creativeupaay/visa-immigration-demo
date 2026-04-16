import mongoose, { Schema, Document } from "mongoose";


import {
  reqCategoryEnum,
  additionalDocVisaType
} from "../types/enums/enums"; 

export interface IDocCategory extends Document {
  category: reqCategoryEnum;
  visaType: additionalDocVisaType;
  question : string | null ;
}

const DocCategorySchema  = new Schema<IDocCategory>(
  {
    category: {
      type: String,
      enum: Object.values(reqCategoryEnum),
      required: true
    },
    visaType: {
      type: String,
      enum: Object.values(additionalDocVisaType),
      required: true
    },
    question : {
      type : String , 
      default : null
    }
  },
  { timestamps: true }
);

export const DocCategoryModel = mongoose.model<IDocCategory>(
  "doccategories",
  DocCategorySchema
);
