import mongoose, { Schema, Document, Types } from "mongoose";

export interface IAction extends Document {
  action: string; // e.g. "create", "read", "edit", "delete"
  featureId: Types.ObjectId;
  description?: string;
}

const ActionSchema = new Schema<IAction>({
  action: { type: String, required: true ,unique:true },
  featureId: { type: Schema.Types.ObjectId, ref: "Feature", required: true }
  // description: { type: String , required : false  , default:undefined},
});

export const ActionModel = mongoose.model<IAction>("Action", ActionSchema);
