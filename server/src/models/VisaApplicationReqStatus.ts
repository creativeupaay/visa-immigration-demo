import mongoose, { Schema, Document, Mixed } from "mongoose";
import { visaApplicationReqStatusEnum} from "../types/enums/enums";

// Interface 
export interface IVisaApplicationRequirementStatus extends Document {
    userId: mongoose.Schema.Types.ObjectId; 
    visaTypeId: mongoose.Schema.Types.ObjectId; 
    visaApplicationId: mongoose.Schema.Types.ObjectId; 
    reqId: mongoose.Schema.Types.ObjectId; 
    stepStatusId: mongoose.Schema.Types.ObjectId; 
    reason: string | null; // Optional 
    value: Mixed | String| null; // Can store any type of value (String, Number, Object, etc.)
    status: visaApplicationReqStatusEnum;
    stepId: mongoose.Schema.Types.ObjectId;
}


const VisaApplicationRequirementStatusSchema = new Schema<IVisaApplicationRequirementStatus>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User", 
            required: true
        },
        visaTypeId: {
            type: Schema.Types.ObjectId,
            ref: "VisaType", 
            required: true
        },
        visaApplicationId: {
            type: Schema.Types.ObjectId,
            ref: "VisaApplication", 
            required: true
        },
        reqId: {
            type: Schema.Types.ObjectId,
            ref: "VisaStepRequirement", 
            required: true
        },
        stepStatusId: {
            type: Schema.Types.ObjectId,
            ref: "VisaApplicationStepStatus", 
            required: true
        },

        status: {
            type: String,
            enum: Object.values(visaApplicationReqStatusEnum),
            default: visaApplicationReqStatusEnum.NOT_UPLOADED,
        },
        reason: {
            type: String, 
            default: null
        },
        value: {
            type: Schema.Types.Mixed || String, 
            default : null 
        },
        stepId: {
            type: Schema.Types.ObjectId,
            ref: "VisaStep", 
            required: true
        },
    }
);


export const VisaApplicationReqStatusModel = mongoose.model<IVisaApplicationRequirementStatus>(
    "VisaApplicationRequirementStatus",
    VisaApplicationRequirementStatusSchema
);
