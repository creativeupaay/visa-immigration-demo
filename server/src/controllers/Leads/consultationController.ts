import { NextFunction, Request, Response } from "express";
import axios from "axios";
import { LeadModel } from "../../leadModels/leadModel";
import { ConsultationModel } from "../../leadModels/consultationModel";
import { leadPriority, leadStatus } from "../../types/enums/enums";
import { consultationStatus } from "../../types/enums/enums";
import { sendHighPriorityLeadEmail } from "../../services/emails/triggers/leads/eligibility-form-filled/highPriority";
import { sendMediumPriorityLeadEmail } from "../../services/emails/triggers/leads/eligibility-form-filled/mediumPriority";
import { consultationCallScheduledAdmin } from "../../services/emails/triggers/admin/consultation/consultation-call-scheduled";
import { getServiceType } from "../../utils/leadToServiceType";
import { constultationCallScheduled } from "../../services/emails/triggers/leads/consultation/consultation-call-scheduled";
import { TaskModel } from "../../models/teamAndTaskModels/taskModel";
import {
  createCustomFields,
  searchPaginatedQuery,
} from "../../services/searchAndPagination/searchPaginatedQuery";
import AppError from "../../utils/appError";
import { logConsultationScheduled } from "../../services/logs/triggers/leadLogs/Consultation/consultation-scheduled";
import { logConsultationLinkSent } from "../../services/logs/triggers/leadLogs/Consultation/consultation-link-sent";
import { logConsultationCompleted } from "../../services/logs/triggers/leadLogs/Consultation/consultation-completed";
import { UserModel } from "../../models/Users";
import mongoose, { Schema, Document, Types } from "mongoose";
import { add } from "winston";

export const getAllConsultations = async (req: Request, res: Response) => {
  try {
    const {
      search,
      page = 1,
      limit = 10,
      sort,
      populate,
      select,
      useCustomSort = "true",
      statusFilter = "", // Add status filter
      dateFilter = "", // Add date filter
    } = req.query;

    const additionalFilters: any = {};

    // Add status filter
    if (statusFilter && statusFilter !== "") {
      if (statusFilter === "MISSED") {
        additionalFilters.status = consultationStatus.SCHEDULED;
        additionalFilters.endTime = { $lt: new Date() };
      } else if (statusFilter === "SCHEDULED") {
        additionalFilters.status = consultationStatus.SCHEDULED;
        additionalFilters.endTime = { $gte: new Date() };
      } else {
        additionalFilters.status = statusFilter;
      }
    }

    // Add date filter
    if (dateFilter && dateFilter !== "") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      if (dateFilter === "Today") {
        additionalFilters.startTime = {
          $gte: today,
          $lt: tomorrow,
        };
      } else if (dateFilter === "Yesterday") {
        additionalFilters.startTime = {
          $gte: yesterday,
          $lt: today,
        };
      }
    }

    if (Array.isArray(req.assignedIds) && req.assignedIds.length > 0) {
      additionalFilters._id = { $in: req.assignedIds };
    }

    let customFields: any[] = [];
    let customSort: any = {};
    let excludeFields: string[] = [];

    if (useCustomSort === "true" && !sort) {
      customFields = [
        createCustomFields.statusOrder({
          SCHEDULED: 0,
          CANCELLED: 1,
          COMPLETED: 2,
        }),
        createCustomFields.timeSort("startTime", {
          $eq: ["$status", "SCHEDULED"],
        }),
      ];

      customSort = {
        statusOrder: 1,
        sortTime: 1,
      };

      excludeFields = ["statusOrder", "sortTime"];
    }

    // Use the enhanced utility
    const result = await searchPaginatedQuery({
      model: ConsultationModel,
      collectionName: "consultations",
      search: search as string,
      page: Number(page),
      limit: Number(limit),
      sort: sort as string,
      additionalFilters,
      populate: populate ? JSON.parse(populate as string) : undefined,
      select: select as string,
      customFields,
      customSort: Object.keys(customSort).length > 0 ? customSort : undefined,
      excludeFields,
    });

    const consultationData = result.data.map((consultation: any) => ({
      ...consultation,
      status:
        consultation.status === consultationStatus.SCHEDULED &&
        consultation.endTime < new Date()
          ? "MISSED"
          : consultation.status,
    }));

    res.status(200).json({
      consultations: consultationData,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      },
    });
  } catch (error: any) {
    console.error("Error fetching consultations:", error);
    res.status(500).json({
      error: "Failed to fetch consultations",
      message: error.message,
    });
  }
};

// send consultation link
export const sendConsultationLink = async (req: Request, res: Response) => {
  const leadId = req.params.leadId;

  const lead = await LeadModel.findById(leadId);

  // Check if assignedIds exist and leadId is not included
  if (
    Array.isArray(req.assignedIds) &&
    !req.assignedIds.map((id) => id.toString()).includes(leadId)
  ) {
    return res.status(403).json({
      message: "Your role does not have permission to do this action.",
    });
  }

  if (!lead) {
    res.status(404);
    throw new Error("Lead not found");
  }

  const isMockCalendlyMode =
    process.env.MOCK_CALENDLY_MODE === "true" ||
    process.env.DEMO_MODE === "true" ||
    process.env.NODE_ENV !== "production";

  let serviceType = "";
  const frontendBase = process.env.FRONTEND_URL || "http://localhost:5173";
  const calendlyLink = isMockCalendlyMode
    ? `${frontendBase}/mock/calendly?leadId=${leadId}`
    : `${process.env.CALENDLY_LINK}?utm_campaign=${leadId}&utm_source=VISADEMO`;

  const visaType = lead.__t?.replace("Lead", "");
  if (visaType === "Dominica") {
    serviceType = "Dominica Passport";
  } else if (visaType === "Grenada") {
    serviceType = "Grenada Passport";
  } else if (visaType === "Portugal") {
    serviceType = "Portugal D7 Visa";
  } else if (visaType === "Dubai") {
    serviceType = "Dubai Business Setup";
  }

  if (!isMockCalendlyMode) {
    if (lead.additionalInfo?.priority === leadPriority.HIGH) {
      await sendHighPriorityLeadEmail(
        lead.email,
        lead.fullName.split(" ")[0],
        serviceType,
        calendlyLink
      );
    } else {
      await sendMediumPriorityLeadEmail(
        lead.email,
        lead.fullName.split(" ")[0],
        serviceType,
        calendlyLink
      );
    }
  }

  // Update lead status
  lead.leadStatus = leadStatus.CONSULTATIONLINKSENT;
  await lead.save();

  // log for Consultation link sent
  await logConsultationLinkSent({
    leadName: lead.fullName,
    adminName: req.admin?.userName,
    leadId: lead._id as mongoose.Types.ObjectId,
    doneBy: req.admin?.userName,
  });

  res
    .status(200)
    .json({
      message: "Consultation link sent successfully",
      calendlyLink,
      isMock: isMockCalendlyMode,
    });
};

// calendly webhook
export const calendlyWebhook = async (req: Request, res: Response) => {
  console.log(
    `[Webhook Triggered] Calendly webhook hit at ${new Date().toISOString()}`
  );
  // console.log(`Raw request body:`, JSON.stringify(req.body, null, 2));

  const calendlyEvent = req.body.event;
  const payload = req.body.payload;

  const source = payload?.tracking?.utm_source || "";

  console.log(`this is our sourece : ${source}`);

  const leadId = payload?.tracking?.utm_campaign; // if you're setting leadId in Calendly tracking parameters

  // const email = payload?.email;
  // const name = payload?.name;
  const calendlyEventUrl = payload?.uri;
  const startTime = payload?.scheduled_event?.start_time;
  // const endTime = payload?.scheduled_event?.end_time;
  const rescheduleUrl = payload?.reschedule_url;

  //  Proceed only if source is VISADEMO
  if (source !== "VISADEMO") {
    console.log(`Webhook source is not VISADEMO. Ignoring this event.`);
    res
      .status(200)
      .json({ message: "Webhook source is not VISADEMO, skipping." }); // res status ko change karna hai
    return;
  }

  if (!leadId) {
    console.log(
      `Actually leadId is not present in meta data , so we can't proceed further and returning`
    );
    res.status(400).json({ message: "Missing leadId in tracking data" });
    return;
  }

  const lead = await LeadModel.findById(leadId);

  // const caseId = lead?.caseId;
  // console.log(`this is your caseId : ${caseId}`);

  if (!lead) {
    console.log(`lead is not not present for this leadId : ${leadId}`);
    res.status(404).json({ message: "Lead not found" });
    return;
  }

  // case - 1
  if (calendlyEvent === "invitee.created") {
    const eventRes = await axios.get(payload.scheduled_event.uri, {
      headers: {
        Authorization: `Bearer ${process.env.CALENDLY_API_KEY}`,
      },
    });

    // const joinUrl = eventRes.data?.resource?.location?.join_url || "";
    const joinUrl = payload?.scheduled_event?.location.join_url || "";

    const consultationDate = new Date(startTime);
    const formattedDate = consultationDate.toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    await consultationCallScheduledAdmin(
      lead.fullName.split(" ")[0],
      getServiceType(lead.__t ?? ""),
      formattedDate,
      joinUrl
    );
    await constultationCallScheduled(
      lead.email,
      lead.fullName.split(" ")[0],
      getServiceType(lead.__t ?? ""),
      formattedDate,
      joinUrl,
      lead.additionalInfo?.priority
    );

    // log for Consultation  Scheduled
    await logConsultationScheduled({
      leadName: lead.fullName,
      scheduledAt: consultationDate,
      leadId: lead._id as mongoose.Types.ObjectId,
      doneBy: lead.fullName,
    });

    const newConsultation = await ConsultationModel.create({
      name: payload?.name,
      email: payload?.email,
      calendlyEventUrl: payload?.uri, // ek particular consultation/schedule ki info ke liye use hota hai ...
      startTime: payload?.scheduled_event?.start_time,
      endTime: payload?.scheduled_event?.end_time,
      joinUrl,
      rescheduleUrl,
      formattedDate,
      leadId: leadId,
      // caseId: lead.caseId,
    });

    // Update the  consultation id in taskModel
    await TaskModel.updateMany(
      { attachedLead: leadId }, // condition: jis task me ye leadId ho
      { $set: { attachedConsultation: newConsultation._id } }
    );

    console.log(
      `Consultation created: ${JSON.stringify(newConsultation, null, 2)}`
    );

    lead.leadStatus = leadStatus.CONSULTATIONSCHEDULED;
    await lead.save();

    console.log(`Lead status updated successfully: ${lead.leadStatus}`);

    res.status(200).json({ message: "Consultation created and lead updated" });
    return;
  } else if (calendlyEvent === "invitee.canceled") {
    console.log(`*****invitee.canceled event is triggered***`);
    console.log(`*****invitee.canceled event is triggered***`);
    console.log(`*****invitee.canceled event is triggered***`);
    console.log(`*****invitee.canceled event is triggered***`);
    console.log(`*****invitee.canceled event is triggered***`);

    console.log(
      `This is Raw request body in cancel event:`,
      JSON.stringify(req.body, null, 2)
    );

    const consultation = await ConsultationModel.findOne({ calendlyEventUrl });

    if (consultation) {
      await ConsultationModel.deleteOne({ calendlyEventUrl });
      console.log(`Consultation deleted for this  event: ${calendlyEventUrl}`);
      console.log(`Consultation deleted for this  event: ${calendlyEventUrl}`);
      console.log(`Consultation deleted for this  event: ${calendlyEventUrl}`);
    }

    // Update the  consultation id in taskModel
    await TaskModel.updateMany(
      { attachedLead: leadId }, // condition: jis task me ye leadId ho
      { $set: { attachedConsultation: null } }
    );

    // Optional: Update lead status
    // lead.leadStatus = leadStatus.CONSULTATIONCANCELLED || "PENDING";
    // await lead.save();

    res
      .status(200)
      .json({ message: "Consultation cancelled and lead updated" });
    return;
  }

  // Unhandled or future events
  console.log("Unhandled Calendly event:", calendlyEvent);
  return res.status(200).json({ message: "Unhandled event received" });
};






// Mark consultation as completed
export const markConsultationAsCompleted = async (
  req: Request,
  res: Response
) => {
  const consultationId = req.params.consultationId;

  // Check if assignedIds exist and consultationId is not included
  if (
    Array.isArray(req.assignedIds) &&
    !req.assignedIds.map((id) => id.toString()).includes(consultationId)
  ) {
    return res.status(403).json({
      message: "Your role does not have permission to do this action.",
    });
  }

  // 1. Update consultation status
  const updatedConsultation = await ConsultationModel.findByIdAndUpdate(
    consultationId,
    { status: consultationStatus.COMPLETED },
    { new: true }
  );

  if (!updatedConsultation) {
    res.status(404);
    throw new Error("Consultation not found");
  }

  // 2. Update lead status
  await LeadModel.findByIdAndUpdate(updatedConsultation.leadId, {
    leadStatus: leadStatus.CONSULTATIONDONE,
  });

  const leadDoc = await LeadModel.findById(updatedConsultation.leadId).select(
    "name"
  );

  await logConsultationCompleted({
    leadName: leadDoc?.fullName,
    adminName: req.admin?.userName,
    leadId: updatedConsultation.leadId,
    doneBy: req.admin?.userName,
  });

  res.status(200).json({
    message: "Consultation marked as completed",
  });
};

export const getConsultationStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    const pipeline = [
      {
        $match: {
          leadStatus: {
            $in: [
              leadStatus.CONSULTATIONLINKSENT,
              leadStatus.CONSULTATIONSCHEDULED,
              leadStatus.CONSULTATIONDONE,
              leadStatus.PAYMENTLINKSENT,
            ],
          },
        },
      },
      {
        $group: {
          _id: "$leadStatus",
          totalCount: { $sum: 1 },
          currentMonthCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$updatedAt", currentMonthStart] },
                    { $lte: ["$updatedAt", currentMonthEnd] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $group: {
          _id: null,
          statuses: {
            $push: {
              status: "$_id",
              totalCount: "$totalCount",
              currentMonthCount: "$currentMonthCount",
            },
          },
        },
      },
    ];

    const [result] = await LeadModel.aggregate(pipeline);

    const consultationStats = {
      [leadStatus.CONSULTATIONLINKSENT]: 0,
      [leadStatus.CONSULTATIONSCHEDULED]: 0,
      [leadStatus.CONSULTATIONDONE]: 0,
      [leadStatus.PAYMENTLINKSENT]: 0,
    };

    let totalConsultations = 0;

    // Process results
    if (result && result.statuses) {
      result.statuses.forEach((item: any) => {
        const status = item.status;
        const count = item.totalCount;

        if (status in consultationStats) {
          consultationStats[status as keyof typeof consultationStats] = count;
          totalConsultations += count;
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...consultationStats,
        totalConsultations,
        currentMonth: {
          year: now.getFullYear(),
          month: now.getMonth() + 1,
        },
      },
      message: "Consultation statistics retrieved successfully",
    });
  } catch (error) {
    console.error("Error in getConsultationStats:", error);
    next(new AppError("Internal Server Error", 500));
  }
};
