import mongoose, { Schema } from "mongoose";
import { VisaTypeEnum } from "../types/enums/enums";



interface IVisaType extends Document {
    visaType: VisaTypeEnum
    // steps: IStep[];
}

const VisaTypeSchema = new Schema<IVisaType>({
    visaType: {
        type: String,
        enum: Object.values(VisaTypeEnum),
        required: true
    },    
},
 { timestamps: true}
);

export const VisaTypeModel = mongoose.model<IVisaType>("VisaType", VisaTypeSchema);



