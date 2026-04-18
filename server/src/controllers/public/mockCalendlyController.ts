import { Request, Response } from "express";
import mongoose from "mongoose";
import { ConsultationModel } from "../../leadModels/consultationModel";
import { LeadModel } from "../../leadModels/leadModel";
import { leadStatus } from "../../types/enums/enums";
import { TaskModel } from "../../models/teamAndTaskModels/taskModel";
import { logConsultationScheduled } from "../../services/logs/triggers/leadLogs/Consultation/consultation-scheduled";

const formatMeetTime = (date: Date) =>
  date.toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

export const mockScheduleConsultation = async (req: Request, res: Response) => {
  const { leadId, startTime } = req.body ?? {};

  if (!leadId || !startTime) {
    return res.status(400).json({
      success: false,
      message: "leadId and startTime are required",
    });
  }

  const lead = await LeadModel.findById(leadId);
  if (!lead) {
    return res.status(404).json({ success: false, message: "Lead not found" });
  }

  const start = new Date(startTime);
  if (Number.isNaN(start.getTime())) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid startTime format" });
  }

  const end = new Date(start);
  end.setMinutes(end.getMinutes() + 30);

  const baseFrontend = process.env.FRONTEND_URL || "http://localhost:5173";
  const eventToken = `mock-${lead._id}-${start.getTime()}`;
  const calendlyEventUrl = `${baseFrontend}/mock/calendly/event/${eventToken}`;
  const joinUrl = `${baseFrontend}/mock/consultation-room/${eventToken}`;
  const rescheduleUrl = `${baseFrontend}/mock/calendly?leadId=${lead._id}`;

  const existingConsultation = await ConsultationModel.findOne({ leadId: lead._id });

  const consultationPayload = {
    name: lead.fullName,
    email: lead.email,
    startTime: start,
    endTime: end,
    joinUrl,
    rescheduleUrl,
    calendlyEventUrl,
    formattedDate: formatMeetTime(start),
    leadId: lead._id,
  };

  const consultation = existingConsultation
    ? await ConsultationModel.findByIdAndUpdate(
        existingConsultation._id,
        consultationPayload,
        { new: true }
      )
    : await ConsultationModel.create(consultationPayload);

  await TaskModel.updateMany(
    { attachedLead: lead._id },
    { $set: { attachedConsultation: consultation?._id } }
  );

  lead.leadStatus = leadStatus.CONSULTATIONSCHEDULED;
  await lead.save();

  await logConsultationScheduled({
    leadName: lead.fullName,
    scheduledAt: start,
    leadId: lead._id as mongoose.Types.ObjectId,
    doneBy: lead.fullName,
  });

  return res.status(200).json({
    success: true,
    message: "Mock consultation scheduled successfully",
    data: {
      consultationId: consultation?._id,
      joinUrl,
      rescheduleUrl,
      startTime: start,
      formattedDate: consultation?.formattedDate,
    },
  });
};
