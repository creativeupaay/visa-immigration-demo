import mongoose, { Schema, Document } from "mongoose";

export interface IFeature extends Document {
  name: string; // e.g. "Manage Leads"
  code: string; // e.g. "LEAD_MANAGEMENT" (unique identifier)
}

const FeatureSchema = new Schema<IFeature>({
  name: { type: String, required: true , unique: true },
  code: { type: String, required: true, unique: true }
});

export const FeatureModel = mongoose.model<IFeature>("Feature", FeatureSchema);
