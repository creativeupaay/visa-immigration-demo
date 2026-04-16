import { NextFunction, Request, Response } from "express";
import AppError from "../../utils/appError";
import { LeadModel } from "../../leadModels/leadModel";
import { ConsultationModel } from "../../leadModels/consultationModel";
import { PaymentModel } from "../../leadModels/paymentModel";
import { leadStatus } from "../../types/enums/enums";
import { searchPaginatedQuery } from "../../services/searchAndPagination/searchPaginatedQuery";
import { streamExcelToResponse } from "../../utils/downloadExcelReport";

export const getAllLeads = async (req: Request, res: Response) => {
  const { search, page = "1", limit = "10", sort = "-createdAt" } = req.query;

  const additionalFilters: any = {};

  if (Array.isArray(req.assignedIds)) {
    if (req.assignedIds.length === 0) {
      return res.status(200).json({
        leads: [],
        pagination: {
          total: 0,
          page: Number(page),
          limit: Number(limit),
          totalPages: 0,
        },
      });
    } else {
      additionalFilters._id = { $in: req.assignedIds };
    }
  }

  // 2. Run paginated query
  const result = await searchPaginatedQuery({
    model: LeadModel,
    collectionName: "leads",
    search: search as string,
    page: Number(page),
    limit: Number(limit),
    sort,
    additionalFilters,
  });

  // 3. Return response
  res.status(200).json({
    leads: result.data,
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    },
  });
};

export const downloadLeadsReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "startDate and endDate are required" });
    }

    const additionalFilters: any = {};
    additionalFilters.createdAt = {
      $gte: new Date(startDate as string),
      $lte: new Date(endDate as string),
    };

    const columns = [
      { key: "nanoLeadId", header: "Case ID", width: 15 },
      { key: "fullName", header: "Full Name", width: 20 },
      { key: "email", header: "Email", width: 25 },
      { key: "phone", header: "Phone Number", width: 18 },
      { key: "createdAt", header: "Submission Date", width: 18 },
      { key: "additionalInfo.priority", header: "Priority", width: 12 },
    ];

    if (Array.isArray(req.assignedIds)) {
      if (req.assignedIds.length === 0) {
        return await streamExcelToResponse({
          filename: `leads_report_${new Date().toISOString().split("T")[0]}.xlsx`,
          response: res,
          sheets: [
            {
              name: "Leads Report",
              data: [],
              columns,
            },
          ],
        });
      } else {
        additionalFilters._id = { $in: req.assignedIds };
      }
    }

    const leads = await LeadModel.find(additionalFilters).sort({
      createdAt: -1,
    });

    const startDateFormatted = new Date(startDate as string)
      .toISOString()
      .split("T")[0];
    const endDateFormatted = new Date(endDate as string)
      .toISOString()
      .split("T")[0];
    const filename = `leads_report_${startDateFormatted}_to_${endDateFormatted}.xlsx`;
    await streamExcelToResponse({
      filename,
      response: res,
      sheets: [
        {
          name: "Leads Report",
          data: leads,
          columns,
        },
      ],
    });
  } catch (error) {
    console.error("Error generating leads report:", error);

    if (!res.headersSent) {
      res.status(500).json({
        message: "Failed to generate leads report",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
};

// export const getParticularLeadInfo = async (req: Request, res: Response) => {
// input -->> leadId

// send lead info (Name , email, phone , appliedFor(visaType) , Case-id )

// send lead Status

// send consultationInfo -->> (consultation time (meet ka time) , status , join url)

// send payment info -->> (status , invioce , method)

// eligibility form -->> (complete lead document )
// };

export const getParticularLeadInfo = async (req: Request, res: Response) => {
  // iske input ko caseId kar sakte hai
  const leadId = req.params.leadId;

  if (!leadId) {
    return res.status(400).json({ message: "leadId is required" });
  }

  // Check if assignedIds exist and leadId is not included
  if (
    Array.isArray(req.assignedIds) &&
    !req.assignedIds.map((id) => id.toString()).includes(leadId)
  ) {
    return res.status(403).json({
      message: "Your role does not have permission to do this action.",
    });
  }

  const lead = await LeadModel.findById(leadId);
  if (!lead) {
    return res.status(404).json({ message: "Lead not found" });
  }

  const consultation = await ConsultationModel.findOne({ leadId });
  const payment = await PaymentModel.findOne({ leadId });

  // now handel the appliedFor field -->>
  const formIdToVisaType: Record<string, string> = {
    "250901425096454": "Dubai",
    "250912382847462": "Portugal",
    "250912364956463": "DomiGrena",
  };

  const visaType = lead.__t?.replace("Lead", "") || "Unknown";

  // const visaType = formIdToVisaType[lead.formId] || "Unknown";

  // Convert Mongoose doc to plain JS object
  const plainLead = lead.toObject();

  // Destructure base fields
  const {
    fullName,
    nationality,
    email,
    phone,
    additionalInfo = {},
  } = plainLead;

  // Clone and remove 'priority' from additionalInfo if it exists
  const { priority, ...cleanedAdditionalInfo } = additionalInfo || {};

  const response = {
    leadInfo: {
      name: lead.fullName,
      email: lead.email,
      phone: lead.phone,
      appliedFor: visaType, // isko sahi se handle karna hai
      createdAt: lead.createdAt,
      caseId: lead.nanoLeadId,
    },

    leadStatus: lead.leadStatus,

    consultationInfo: consultation
      ? {
          consultationId: consultation._id,
          meetTime: consultation.formattedDate,
          status: consultation.status,
          joinUrl: consultation.joinUrl,
          rescheduleUrl: consultation.rescheduleUrl,
        }
      : null,

    paymentInfo: payment
      ? {
          status: payment.status,
          method: payment.paymentMethod,
          invoice: payment.invoiceUrl,
        }
      : null,

    eligibilityForm: {
      fullName,
      nationality,
      email,
      phone,
      additionalInfo: cleanedAdditionalInfo,
    },
  };

  res.status(200).json({ success: true, data: response });
};

// reject lead
export const rejectLead = async (req: Request, res: Response) => {
  // iske input ko bhi caseId kar sakye hai
  const leadId = req.params.leadId;
  const { reasonOfRejection } = req.body;

  if (typeof reasonOfRejection !== "string") {
    res.status(400);
    throw new Error("reasonOfRejection is required and must be a string");
  }

  // Check if assignedIds exist and leadId is not included
  if (
    Array.isArray(req.assignedIds) &&
    !req.assignedIds.map((id) => id.toString()).includes(leadId)
  ) {
    return res.status(403).json({
      message: "Your role does not have permission to do this action.",
    });
  }

  const updatedLead = await LeadModel.findByIdAndUpdate(
    leadId,
    {
      leadStatus: leadStatus.REJECTED,
      reasonOfRejection: reasonOfRejection,
    },
    { new: true }
  );

  if (!updatedLead) {
    res.status(404);
    throw new Error("Lead not found");
  }

  res.status(200).json({ message: "Lead rejected successfully" });
};

export const getLeadsStats = async (
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

    const leadsStats = {
      [leadStatus.INITIATED]: 0,
      [leadStatus.PAYMENTDONE]: 0,
      [leadStatus.REJECTED]: 0,
    };

    let totalLeads = 0;

    // Process results
    if (result && result.statuses) {
      result.statuses.forEach((item: any) => {
        const status = item.status;
        const count =
          status === leadStatus.PAYMENTDONE || status === leadStatus.REJECTED
            ? item.currentMonthCount
            : item.totalCount;

        if (status in leadsStats) {
          leadsStats[status as keyof typeof leadsStats] = count;
          totalLeads += count;
        }
      });
    }

    const activeLeads = totalLeads - leadsStats[leadStatus.REJECTED];
    const conversionRate =
      activeLeads > 0
        ? Math.round((leadsStats[leadStatus.PAYMENTDONE] / activeLeads) * 100)
        : 0;

    res.status(200).json({
      success: true,
      data: {
        ...leadsStats,
        totalLeads,
        conversionRate,
        currentMonth: {
          year: now.getFullYear(),
          month: now.getMonth() + 1,
        },
      },
      message: "Lead statistics retrieved successfully",
    });
  } catch (error) {
    console.error("Error in getLeadsStats:", error);
    next(new AppError("Internal Server Error", 500));
  }
};
