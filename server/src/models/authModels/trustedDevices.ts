// import mongoose, { Schema, Document } from "mongoose";

// // Define the interface
// export interface ITrustedDevice extends Document {
//   userId: mongoose.Types.ObjectId;
//   deviceId: string;
//   token: string;
//   expiresAt: Date;
// }

// // Define the schema
// const TrustedDeviceSchema = new Schema<ITrustedDevice>(
//   {
//     userId: {
//       type: Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     deviceId: {
//       type: String,
//       required: true,
//     },
//     token: {
//       type: String,
//       required: true,
//     },
//     expiresAt: {
//       type: Date,
//       required: true,
//     },
//   },
//   { timestamps: true }
// );

// // Export the model
// export const TrustedDeviceModel = mongoose.model<ITrustedDevice>(
//   "TrustedDevice",
//   TrustedDeviceSchema
// );
