import mongoose, { Schema, Document, Types } from "mongoose";
import { logTypeEnum } from "../../types/enums/enums";

export interface ILog extends Document {
  logMsg: string;
  doneBy: string | null;
  logType: logTypeEnum; 
  leadId : Types.ObjectId | null;
  visaApplicationId : Types.ObjectId | null;
  taskId : Types.ObjectId | null;
}

const LogSchema = new Schema<ILog>({
  logMsg: { type : String , required : true},
  doneBy: { type : String , default: null },
  logType: {
    type: String,
    required: true,
    enum: Object.values(logTypeEnum),
  },
  leadId: { type : Schema.Types.ObjectId, ref: "Lead", default: null },
  visaApplicationId: { type : Schema.Types.ObjectId, ref: "VisaApplication", default: null },
  taskId: { type : Schema.Types.ObjectId, ref: "VisaApplication", default: null },
},
 {
    timestamps: true 
  });

export const LogModel = mongoose.model<ILog>("Log", LogSchema);


