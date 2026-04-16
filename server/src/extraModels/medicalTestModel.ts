import mongoose, { Schema, Document } from 'mongoose';
import { medicalTestStatus } from "../types/enums/enums";


// export interface IRequestedSlot {
//   date: Date | null;
//   time: string | null;
// }
export interface IMedicalTest extends Document {
  date: Date;
  time: string;
  hospitalName: string;
  address: string;
  contactNumber: string;
  status: medicalTestStatus;
  rescheduleReason:string|null;
  // requestedSlot: IRequestedSlot | null;
  stepStatusId: mongoose.Schema.Types.ObjectId;
}

const MedicalTestSchema = new Schema<IMedicalTest>({
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  hospitalName: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(medicalTestStatus),
    required: true,
  },
  // nested fields ke case me aisa karna hota hai...
  // requestedSlot: {
  //   type: {
  //     date: { type: Date  },
  //     time: { type: String  },
  //   },
  //   default: null,
  // },
  rescheduleReason: {
    type: String,
    default: null,
  },  
  stepStatusId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VisaApplicationStepStatus',
    required: true,
    unique: true,
  },
});

export const MedicalTestModel = mongoose.model<IMedicalTest>(
  "MedicalTest",
  MedicalTestSchema
);
