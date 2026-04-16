import mongoose, { Schema, Document, Types } from "mongoose";
import { taskPriorityEnum, taskStatusEnum } from "../../types/enums/enums";

interface IRemark {
  _id?: mongoose.Types.ObjectId;
  remarkMsg: string;
  doneBy: mongoose.Types.ObjectId;
}

export interface ITask extends Document {
  taskName: string;
  description?: string;
  priority: taskPriorityEnum;

  startDate: Date;
  endDate: Date;

  attachedLead: Types.ObjectId | null;
  attachedConsultation: Types.ObjectId | null;
  attachedVisaApplication: Types.ObjectId | null;
  attachedClient: Types.ObjectId | null;

  status: taskStatusEnum;

  files: string[];
  remarks: IRemark[];
}

const TaskSchema = new Schema<ITask>(
  {
    taskName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    priority: {
      type: String,
      enum: Object.values(taskPriorityEnum),
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    attachedLead: {
      type: Schema.Types.ObjectId,
      ref: "Leads",
      default: null,
    },
    attachedConsultation: {
      type: Schema.Types.ObjectId,
      ref: "Consultations",
      default: null,
    },
    attachedVisaApplication: {
      type: Schema.Types.ObjectId,
      ref: "VisaApplications",
      default: null,
    },
    attachedClient: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      default: null,
    },
    files: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: Object.values(taskStatusEnum),
      default: taskStatusEnum.DUE,
      required: true,
    },
    remarks: {
      type: [
        {
          remarkMsg: {
            type: String,
            required: true,
          },
          doneBy: {
            type: Schema.Types.ObjectId,
            ref: "Users",
            required: true,
          },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export const TaskModel = mongoose.model<ITask>("Tasks", TaskSchema);
