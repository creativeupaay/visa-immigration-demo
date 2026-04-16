import mongoose, { Schema, Document } from "mongoose";
import { CustomFieldTypeEnum } from "../types/enums/enums";




export interface ICustomField extends Document {
  fieldName: string;
  fieldType: CustomFieldTypeEnum;
  options: string[];
  // required: boolean;

}



const CustomFieldSchema: Schema = new Schema<ICustomField>({

  fieldName: { type: String, required: true, unique: true },
  fieldType: {
    type: String,
    required: true,
    enum: Object.values(CustomFieldTypeEnum)
  },
  options: {
    type: [String],
    default: []
  },
  // required: {
  //   type: Boolean,
  //   default: false // default = not mandatory
  // }
});

export const CustomFieldModel = mongoose.model<ICustomField>("CustomField", CustomFieldSchema);
