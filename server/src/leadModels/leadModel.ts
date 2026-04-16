import { leadStatus } from "../types/enums/enums";
import { Schema, model, Document } from "mongoose";
import { generateShortId } from "../utils/generateShortId";

export interface ILead extends Document {
  formId: string;
  fullName: string;
  nationality: string;
  email: string;
  phone: string;

  leadStatus: leadStatus;

  additionalInfo?: Record<string, any>;
  reasonOfRejection?: string | null;

  createdAt?: Date;
  updatedAt?: Date;

  nanoLeadId?: string;
  __t?: string;
}

const LeadSchema = new Schema<ILead>(
  {
    formId: { type: String, required: true },
    fullName: { type: String, required: true },
    nationality: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },

    leadStatus: {
      type: String,
      enum: Object.values(leadStatus),
      default: leadStatus.INITIATED,
    },

    additionalInfo: {
      type: Schema.Types.Mixed,
      default: {},
    },

    reasonOfRejection: {
      type: String,
      default: null,
    },

    nanoLeadId: {
      type: String,
      unique: true,
      // required: true,
    },
  },
  { timestamps: true }
);

// Pre save hook
LeadSchema.pre("save", async function (next) {
  const lead = this as ILead;

  // Only generate caseId if it's a new document
  if (lead.isNew) {
    let nanoLeadId;
    let exists = true;

    do {
      const shortId = generateShortId(6); // e.g., A7C8X9
      const year = new Date().getFullYear();
      nanoLeadId = `E360-L-${shortId}`;

      const existing = await LeadModel.exists({ nanoLeadId });
      exists = existing !== null;
    } while (exists);

    lead.nanoLeadId = nanoLeadId;
  }

  next();
});

export const LeadModel = model<ILead>("Lead", LeadSchema);
