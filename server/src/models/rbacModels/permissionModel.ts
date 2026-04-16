import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPermission extends Document {
  roleId: Types.ObjectId;
  actionId: Types.ObjectId;
}

const PermissionSchema = new Schema<IPermission>({
  roleId: { type: Schema.Types.ObjectId, ref: "Role", required: true },
  actionId: { type: Schema.Types.ObjectId, ref: "Action", required: true },
});

export const PermissionModel = mongoose.model<IPermission>("Permission", PermissionSchema);
