import { NextFunction, Request, Response } from "express";
import { VisaTypeModel } from "../../models/VisaType";
import { VisaApplicationModel } from "../../models/VisaApplication";
import { VisaStepModel } from "../../models/VisaStep";
import mongoose, { Schema, Document, Types } from "mongoose";
import { searchPaginatedQuery } from "../../services/searchAndPagination/searchPaginatedQuery";
import AppError from "../../utils/appError";
import { streamExcelToResponse } from "../../utils/downloadExcelReport";

export const fetchAllStepsOfParticularVisaType = async (
  req: Request,
  res: Response
) => {
  const { visaType } = req.query;

  if (!visaType) {
    return res
      .status(400)
      .json({ error: "visaType query parameter is required" });
  }
  const visaTypeDoc = await VisaTypeModel.findOne({ visaType });

  if (!visaTypeDoc) {
    return res.status(404).json({ error: "Visa type not found" });
  }

  try {
    const visaTypeId = visaTypeDoc._id;
    const allSteps = await VisaStepModel.find({ visaTypeId }).sort({
      stepNumber: 1,
    });
    const stepNames = allSteps.map((step) => step.stepName);
    return res.status(200).json({ stepNames });
  } catch (error) {
    console.error("Error fetching visa applications:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// 1. -->> req.assignedId vari ka exist hi na karna  -->> send all visaApplications
// 2. -->> exist toh karta hai , but empty hai -->> send result array empty
// API for fetching all apllications of a particular type
export const fetchApplicationsOfParticularType = async (
  req: Request,
  res: Response
) => {
  const {
    visaType,
    page = 1,
    limit = 10,
    search = "",
    statusFilter = "",
  } = req.query;

  if (!visaType) {
    return res
      .status(400)
      .json({ error: "visaType query parameter is required" });
  }

  const visaTypeDoc = await VisaTypeModel.findOne({ visaType });

  if (!visaTypeDoc) {
    return res.status(404).json({ error: "Visa type not found" });
  }

  let additionalFilters: any = {
    visaTypeId: visaTypeDoc._id,
  };

  if (statusFilter && statusFilter !== "") {
    const allSteps = await VisaStepModel.find({
      visaTypeId: visaTypeDoc._id,
    }).sort({ stepNumber: 1 });
    const stepNames = allSteps.map((step) => step.stepName);

    const stepIndex = stepNames.findIndex(
      (stepName: string) => stepName === statusFilter
    );

    if (stepIndex !== -1) {
      additionalFilters.currentStep = stepIndex + 1;
    }
  }

  // 4. Assigned filtering logic
  if (Array.isArray(req.assignedIds)) {
    if (req.assignedIds.length === 0) {
      // assignedIds exists but is empty — return empty result
      return res.status(200).json({
        visaApplications: [],
        pagination: {
          total: 0,
          page: Number(page),
          limit: Number(limit),
          totalPages: 0,
        },
      });
    } else {
      // ✅ assignedIds exists and is non-empty — filter by them
      additionalFilters._id = { $in: req.assignedIds };
    }
  }

  try {
    const result = await searchPaginatedQuery({
      model: VisaApplicationModel,
      collectionName: "visaApplications",
      search: search as string,
      page: Number(page),
      limit: Number(limit),
      sort: { createdAt: -1 },
      additionalFilters,
      populate: [
        {
          path: "leadId",
          select: "_id caseId fullName email phone",
        },
        {
          path: "userId",
          select: "_id caseId name email phone",
        },
      ],
    });

    res.status(200).json({
      visaApplications: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  } catch (error: any) {
    console.error("Error in fetchApplicationsOfParticularType:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
};

export const downloadVisaApplicationsReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { visaType, startDate, endDate } = req.query;
    if (!visaType || !startDate || !endDate) {
      return next(new AppError("Missing required query parameters", 400));
    }
    const visaTypeDoc = await VisaTypeModel.findOne({ visaType });
    if (!visaTypeDoc) {
      return next(new AppError("Visa type not found", 404));
    }
    const visaTypeId = visaTypeDoc._id;

    const columns = [
      { header: "Case ID", key: "nanoVisaApplicationId", width: 20 },
      { header: "Name", key: "userId.name", width: 20 },
      { header: "Email", key: "userId.email", width: 20 },
      { header: "Date", key: "createdAt", width: 20 },
      { header: "Phone Number", key: "userId.phone", width: 20 },
      { header: "Status", key: "status", width: 20 },
      { header: "Current Step", key: "currentStep", width: 20 },
    ];
    const filter: any = {
      visaTypeId,
      createdAt: {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string).setHours(23, 59, 59, 999),
      },
    };
    if (Array.isArray(req.assignedIds) && req.assignedIds.length > 0) {
      filter._id = { $in: req.assignedIds };
    }

    const allSteps = await VisaStepModel.find({
      visaTypeId: visaTypeDoc._id,
    }).sort({ stepNumber: 1 });
    const stepNames = allSteps.map((step) => step.stepName);

    const visaApplications = await VisaApplicationModel.find(filter)
      .populate("userId", "name email phone")
      .sort({ createdAt: -1 })
      .lean();

    const data = visaApplications.map((application) => {
      const currentStepIndex = application.currentStep - 1;
      return {
        ...application,
        currentStep: stepNames[currentStepIndex] || "N/A",
      };
    });

    const startDateFormatted = new Date(startDate as string)
      .toISOString()
      .split("T")[0];
    const endDateFormatted = new Date(endDate as string)
      .toISOString()
      .split("T")[0];
    const filename = `${visaType}_applications_report_${startDateFormatted}_to_${endDateFormatted}.xlsx`;
    await streamExcelToResponse({
      filename,
      response: res,
      sheets: [
        {
          name: "Applications Report",
          data: data,
          columns,
        },
      ],
    });
  } catch (error) {
    console.error("Error downloading visa applications report:", error);
    return next(new AppError("Failed to download report", 500));
  }
};

// get info of particular visaApplication
export const getParticularVisaInfo = async (req: Request, res: Response) => {
  const { visaApplicationId } = req.params;

  if (!visaApplicationId) {
    return res.status(400).json({ message: "visaApplicationId is required" });
  }

  // Check if assignedIds exist and leadId is not included
  if (
    Array.isArray(req.assignedIds) &&
    !req.assignedIds.map((id) => id.toString()).includes(visaApplicationId)
  ) {
    return res.status(403).json({
      message: "Your role does not have permission to do this action.",
    });
  }

  const visaData = await VisaApplicationModel.aggregate([
    {
      $match: {
        _id: new Types.ObjectId(visaApplicationId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
    {
      $lookup: {
        from: "payments",
        localField: "paymentId",
        foreignField: "_id",
        as: "payment",
      },
    },
    {
      $unwind: {
        path: "$payment",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "visatypes",
        localField: "visaTypeId",
        foreignField: "_id",
        as: "visaType",
      },
    },
    {
      $unwind: {
        path: "$visaType",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        nanoVisaApplicationId: 1,
        createdAt: 1,
        leadId: 1,
        "user.name": 1,
        "user.email": 1,
        "user.phone": 1,
        "payment.status": 1,
        "payment.paymentMethod": 1,
        "payment.invoiceUrl": 1,
        "visaType.visaType": 1,
      },
    },
  ]);

  if (!visaData || visaData.length === 0) {
    return res.status(404).json({ message: "Visa application not found" });
  }

  const data = visaData[0];

  const response = {
    basicInfo: {
      name: data.user.name,
      email: data.user.email,
      phone: data.user.phone,
      appliedFor: data.visaType?.visaType || "N/A",
      createdAt: data.createdAt,
      caseId: data.nanoVisaApplicationId,
      leadId: data.leadId,
    },
    paymentInfo: data.payment
      ? {
          status: data.payment.status,
          method: data.payment.paymentMethod,
          invoice: data.payment.invoiceUrl,
        }
      : null,
  };

  res.status(200).json({ success: true, data: response });
};
