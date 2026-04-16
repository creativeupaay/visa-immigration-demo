import mongoose, { Schema, Document } from "mongoose";
import { VisaApplicationStatusEnum } from "../types/enums/enums";
import { generateShortId } from "../utils/generateShortId";

export interface IVisaApplication extends Document {
    userId: mongoose.Schema.Types.ObjectId;
    visaTypeId: mongoose.Schema.Types.ObjectId;
    leadId?: mongoose.Schema.Types.ObjectId; // Optional reference to Lead
    currentStep: number;
    status: VisaApplicationStatusEnum;
    nanoVisaApplicationId : string;
    paymentId : mongoose.Schema.Types.ObjectId ;
    createdAt?: Date;
    updatedAt?: Date;
}

const VisaApplicationSchema = new Schema<IVisaApplication>(
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
        leadId: {
            type: Schema.Types.ObjectId,
            ref: "Lead",        // Reference to lead whose application is created from LeadDB
            required: false
        },
        currentStep: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            enum: Object.values(VisaApplicationStatusEnum),
            default: VisaApplicationStatusEnum.PENDING,
        } , 
        nanoVisaApplicationId :{
            type: String,
            unique: true,
            // required: true,
        } , 
        paymentId : {
            type: Schema.Types.ObjectId, 
            ref: "Payment",
            required : true
        }
    },
    { timestamps: true }
);


// Pre saving hook 
VisaApplicationSchema.pre("save", async function (next) {
    const visaApplication = this as IVisaApplication;
  
    // Only generate caseId if it's a new document
    if (visaApplication.isNew) {
      let nanoVisaApplicationId;
      let exists = true;
  
      do {
        // const { nanoid } = await import('nanoid');
        const shortId = generateShortId(6); // e.g., A7C8X9
        const year = new Date().getFullYear();
        nanoVisaApplicationId = `E360-L-${shortId}`;
  
        const existing = await VisaApplicationModel.exists({ nanoVisaApplicationId });
        exists = existing !== null;
      } while (exists);
  
      visaApplication.nanoVisaApplicationId = nanoVisaApplicationId;
    }
  
    next();
  });



export const VisaApplicationModel = mongoose.model<IVisaApplication>(
    "VisaApplication",
    VisaApplicationSchema
);
