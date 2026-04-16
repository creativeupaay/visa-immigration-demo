import mongoose, { Schema, Document } from "mongoose";
import {aimaStatusEnum } from "../types/enums/enums";


// 1. TypeScript Interface
export interface IAIMA extends Document {   


    aimaStatus : aimaStatusEnum;
    isCompleted: boolean ;
    completedOn?: Date | null; 
    aimaNumber ? : string | null;
    stepStatusId: mongoose.Schema.Types.ObjectId;
    
}

// 2. Mongoose Schema
const AIMASchema: Schema = new Schema(
  {

    aimaStatus: { 
        type: String, 
        required: true , 
        enum: Object.values(aimaStatusEnum), 
    },
    isCompleted : {
        type : Boolean, 
        required:true,
        default:false,
    },
    completedOn: { 
        type: Date,
        required: false,
        default: null,
    },
    aimaNumber: { 
        type: String, 
        required: false,
        default: null 
    },
    stepStatusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VisaApplicationStepStatus',
      required: true,
      // unique : true 
    }

  }
);

// 3. Mongoose Model
export const aimaModel = mongoose.model<IAIMA>(
  "aima",
  AIMASchema
);


