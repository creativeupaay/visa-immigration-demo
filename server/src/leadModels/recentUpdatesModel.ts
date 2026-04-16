import mongoose, { Schema, model } from "mongoose";

export interface RecentUpdatesTypes {
  caseId: mongoose.Types.ObjectId;  // Change to ObjectId
  name: string;
  status: string;
}

const recentUpdatesSchema = new Schema<RecentUpdatesTypes>(
  {
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VisaApplication",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const RecentUpdatesModel = model<RecentUpdatesTypes>(
  "RecentUpdates",
  recentUpdatesSchema
);
