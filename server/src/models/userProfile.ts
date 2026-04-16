import mongoose, { Schema, Document } from "mongoose";

export interface IUserProfile extends Document {
  userId: mongoose.Types.ObjectId; 
  profileData: Record<string, any>; 
}

const UserProfileSchema: Schema = new Schema<IUserProfile>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  profileData: { type: Schema.Types.Mixed, default: {} } // Dynamic key-value pairs
});

export const UserProfileModel = mongoose.model<IUserProfile>("UserProfile", UserProfileSchema);
