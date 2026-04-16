import mongoose, { Schema, Document, Types } from "mongoose";

export interface IRole extends Document {
  roleName: string; 
  isEditable : boolean;
}

const RoleSchema = new Schema<IRole>({
  roleName: { type: String, required: true, unique: true },
  isEditable: { type: Boolean,  default: true },
});

export const RoleModel = mongoose.model<IRole>("Role", RoleSchema);
