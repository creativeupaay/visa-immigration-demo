import mongoose, { Schema, Document, Types } from "mongoose";

export interface IUIPermission extends Document {
  code: string;
  orActions: Types.ObjectId[];
  andActions: Types.ObjectId[];
  leadId?: Types.ObjectId;
  visaApplicationId?: Types.ObjectId;
}

const UIPermissionSchema = new Schema<IUIPermission>(
  {
    code: { type: String, required: true },

    orActions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Action",
        default: null,
      },
    ],

    andActions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Action",
        default: null,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const UIPermissionModel = mongoose.model<IUIPermission>(
  "UIPermission",
  UIPermissionSchema
);
