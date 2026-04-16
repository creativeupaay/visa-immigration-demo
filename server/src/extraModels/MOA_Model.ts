
import mongoose, { Schema, Document } from 'mongoose';
import {moaStatusEnum} from "../types/enums/enums";

export interface IMOA  extends Document {
    moaDocument: string;
    signatureFile: string | null;
    status : moaStatusEnum;
    stepStatusId: mongoose.Schema.Types.ObjectId;
}


const MOASchema = new Schema(
    {
        moaDocument: {
            type: String,
            required: true,
        },
        signatureFile: {
            type: String,
            default:null
        },
        status : {
            type: String,
            enum: Object.values(moaStatusEnum),
            required:true,
        },
      stepStatusId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VisaApplicationStepStatus',
        required: true,
        unique : true 
      }
    }
  );
  
  export const moaModel = mongoose.model<IMOA>(
      "MOA",
      MOASchema
    );