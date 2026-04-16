import mongoose, { Schema, Document } from "mongoose";
import { QuestionTypeEnum } from "../types/enums/enums";
import {reqCategoryEnum} from "../types/enums/enums";


export interface IVisaStepRequirement extends Document {
    visaTypeId: mongoose.Schema.Types.ObjectId; 
    visaStepId: mongoose.Schema.Types.ObjectId; 
    question: string;
    requirementType: QuestionTypeEnum;
    required: boolean;
    options: string[];
    reqCategory : reqCategoryEnum;
}


const VisaStepRequirementSchema = new Schema<IVisaStepRequirement>(
    {
        visaTypeId: {
            type: Schema.Types.ObjectId,
            ref: "VisaType", 
            required: true
        },
        visaStepId: {
            type: Schema.Types.ObjectId,
            ref: "VisaStep", 
            // required: true
        },
        question: {
            type: String,
            required: true
        },
        requirementType: {
            type: String,
            enum: Object.values(QuestionTypeEnum),
            // required: true
        },
        required: {
            type: Boolean,
            default: true 
        },
        options: {
            type: [String],
            required: true
        },
        reqCategory : {
           type : String , 
           enum: Object.values(reqCategoryEnum),
           required : true
        }
    }
);


export const VisaStepRequirementModel = mongoose.model<IVisaStepRequirement>(
    "VisaStepRequirement", 
    VisaStepRequirementSchema
);
