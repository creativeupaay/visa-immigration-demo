import mongoose, { Schema, Document } from "mongoose";
import { StepStatusEnum} from "../types/enums/enums";

export interface IVisaApplicationStepStatus extends Document {
    userId: mongoose.Schema.Types.ObjectId; 
    visaTypeId: mongoose.Schema.Types.ObjectId; 
    stepId: mongoose.Schema.Types.ObjectId; 
    visaApplicationId: mongoose.Schema.Types.ObjectId; 
    status: StepStatusEnum;

    reqFilled: Map<string, boolean>;

}


const VisaApplicationStepStatusSchema = new Schema<IVisaApplicationStepStatus>(
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
        stepId: {
            type: Schema.Types.ObjectId,
            ref: "VisaStep", 
            required: true
        },
        visaApplicationId: {
            type: Schema.Types.ObjectId,
            ref: "VisaApplication", 
            required: true
        },
        status: {
            type: String,
            enum: Object.values(StepStatusEnum),
            default: StepStatusEnum.IN_PROGRESS,
        }, 
        reqFilled: {
            type: Map,
            of: Boolean,
            default: {},
        },
    }
);

export const VisaApplicationStepStatusModel = mongoose.model<IVisaApplicationStepStatus>(
    "VisaApplicationStepStatus",
    VisaApplicationStepStatusSchema
);





// unlockedAt field bhi rakhi ja sakti hai ...

// may be yaha per reqFilled : {
    // R1 : bool 
// }   in case when all documents should submitted required
