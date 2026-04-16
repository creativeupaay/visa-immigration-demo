import mongoose, { Document, Schema, Types , model} from "mongoose";
import {LeadModel } from "./leadModel";
import { consultationStatus } from "../types/enums/enums";

// Define the interface
export interface IConsultation extends Document {
  name: string;
  email: string;

  status: consultationStatus;
  
  startTime: Date;
  endTime: Date;
  joinUrl: string;
  calendlyEventUrl: string;
  rescheduleUrl : string;
  formattedDate?: string;

  leadId: Types.ObjectId; // Reference to LeadModel

  // caseId?: string;
}

//  Ek leadId ke corresponding multiple consultations ho sakti hai ....
// fir toh isme caseId wala part bhi problem karga ...
const ConsultationSchema: Schema = new Schema<IConsultation>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  status: {
    type: String,
    enum: Object.values(consultationStatus),
    default: consultationStatus.SCHEDULED,
  },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  joinUrl: { type: String, required: true },
  calendlyEventUrl: { type: String, required: true },
  rescheduleUrl : {type: String ,required : true },
  formattedDate: { type: String },

  leadId: {
    type: Schema.Types.ObjectId,
    ref: LeadModel.modelName,
    required: true,
  },

  // caseId: {
  //   type: String,
  //   unique: true,
  //   required : true ,
  // }
  
});

export const ConsultationModel = model<IConsultation>("Consultation", ConsultationSchema);





// Sample calendly payload data
// {
//     "event": "invitee.created",
//     "payload": {
//       "invitee": {
//         "email": "user@example.com",
//         "name": "Ramesh",
//         "questions_and_answers": [],
//         "scheduled_event": "https://api.calendly.com/scheduled_events/ABCDEFG"
//       },
//       "event": {
//         "start_time": "2025-04-09T10:00:00Z",
//         "end_time": "2025-04-09T10:15:00Z"
//       }
//     }
//   }
  