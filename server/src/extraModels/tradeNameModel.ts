
import mongoose, { Schema, Document } from 'mongoose';
import {tradeNameStatus} from "../types/enums/enums";

export interface ITradeName  extends Document {
    options: [string, string, string];
    reasonOfChange: string | null;
    assignedName: string |  null;
    status : tradeNameStatus;
    stepStatusId: mongoose.Schema.Types.ObjectId;
}


const TradeNameSchema = new Schema(
    {
        options: {
            type: [String],
            required: true,
          },
          reasonOfChange: {
            type: String,
            default:null
          },
          assignedName: {
            type: String,
            default : null
          },
        status : {
            type: String,
            enum: Object.values(tradeNameStatus),
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
  
  export const TradeNameModel = mongoose.model<ITradeName>(
      "TradeName",
      TradeNameSchema
    );