import { NextFunction, Request, Response } from "express";
import AppError from "../../../utils/appError";
import { moaModel } from "../../../extraModels/MOA_Model";
import { moaStatusEnum, StepStatusEnum } from "../../../types/enums/enums";
import mongoose, { Types } from "mongoose";
import { sendApplicationUpdateEmails } from "../../../services/emails/triggers/applicationTriggerSegregate/applicationTriggerSegregate";
import { VisaApplicationStepStatusModel } from "../../../models/VisaApplicationStepStatus";
import { EmailTrigger } from "../../../models/VisaStep";
import { createLogForVisaApplication } from "../../../services/logs/triggers/visaApplications/createLogForVisaApplication";
import { UserModel } from "../../../models/Users";

// For Admin
export const moaUpload = async (req: Request, res: Response) => {
  const { stepStatusId } = req.params;
  const file = req.file;

  if (!stepStatusId || !file) {
    throw new AppError("stepStatusId and file are required.", 400);
  }

  const newMOA = await moaModel.create({
    moaDocument: (file as any).location, // S3 URL
    status: moaStatusEnum.MOA_Uploaded,
    stepStatusId,
  });

  const aggregationResult = await VisaApplicationStepStatusModel.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(stepStatusId) } },
    {
      $lookup: {
        from: "visasteps",
        localField: "stepId",
        foreignField: "_id",
        as: "visaStep",
      },
    },
    { $unwind: "$visaStep" },
    {
      $lookup: {
        from: "visatypes",
        localField: "visaTypeId",
        foreignField: "_id",
        as: "visaType",
      },
    },
    { $unwind: "$visaType" },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        visaApplicationId: 1,
        visaStepId: 1,
        visaTypeId: 1,
        userId: 1,
        "visaStep.emailTriggers": 1,
        "visaStep.logTriggers": 1,
        "visaStep.stepName": 1,
        "visaType.visaType": 1,
        "user.email": 1,
        "user.name": 1,
      },
    },
  ]).exec();

  if (!aggregationResult.length) {
    console.error("Required data not found for stepStatusId:", stepStatusId);
    throw new Error("Required data not found for stepStatusId:" + stepStatusId);
  }


  const trigger = aggregationResult[0].visaStep.emailTriggers.filter(
    (trigger: EmailTrigger) => trigger.templateId === "dubai-user-moa-submitted"
  );

  await sendApplicationUpdateEmails({
    triggers: [trigger],
    stepStatus: StepStatusEnum.SUBMITTED,
    visaType: aggregationResult[0].visaType.visaType,
    email: aggregationResult[0].user.email,
    firstName: aggregationResult[0].user.name,
  });

  const id = req.admin?.id;

  const userDoc = await UserModel
      .findById(id)
      .select("name")
      .lean();

  await createLogForVisaApplication({
    triggers : aggregationResult[0].visaStep.logTriggers,
    clientName : aggregationResult[0].user.name,
    adminName : userDoc?.name,
    visaType : aggregationResult[0].visaType.visaType,
    stepName : aggregationResult[0].visaStep.stepName,
    stepStatus : moaStatusEnum.MOA_Uploaded, 
    doneBy : req.admin?.userName || req.user?.userName ,
    visaApplicationId : aggregationResult[0].visaApplicationId,
  });

  res.status(201).json({
    message: "MOA document uploaded and MOA record created.",
    moaStatus: newMOA.status,
  });
};

// For User
export const moaDocumentFetch = async (req: Request, res: Response) => {
  const { stepStatusId } = req.params;

  if (!stepStatusId) {
    throw new AppError("stepStatusId is required in params.", 400);
  }

  const moa = await moaModel.findOne({ stepStatusId });

  if (!moa) {
    throw new AppError("MOA not found for the given stepStatusId.", 404);
  }

  res.status(200).json({
    message: "MOA document fetched successfully.",
    moaDocument: moa.moaDocument,
    moaStatus: moa.status,
  });
};

// For User
export const uploadSignature = async (req: Request, res: Response) => {
  const { stepStatusId } = req.params;
  const file = req.file;

  if (!stepStatusId || !file) {
    throw new AppError("stepStatusId and signature file are required.", 400);
  }

  const moa = await moaModel.findOne({ stepStatusId });

  if (!moa) {
    throw new AppError("MOA not found for the given stepStatusId.", 404);
  }

  (moa.signatureFile = (file as any).location),
    (moa.status = moaStatusEnum.Sig_Uploaded);
  await moa.save();

  const aggregationResult = await VisaApplicationStepStatusModel.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(stepStatusId) } },
    {
      $lookup: {
        from: "visasteps",
        localField: "stepId",
        foreignField: "_id",
        as: "visaStep",
      },
    },
    { $unwind: "$visaStep" },
    {
      $lookup: {
        from: "visatypes",
        localField: "visaTypeId",
        foreignField: "_id",
        as: "visaType",
      },
    },
    { $unwind: "$visaType" },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        visaApplicationId: 1,
        visaStepId: 1,
        visaTypeId: 1,
        userId: 1,
        "visaStep.emailTriggers": 1,
        "visaStep.logTriggers": 1,
        "visaStep.stepName": 1,
        "visaType.visaType": 1,
        "user.email": 1,
        "user.name": 1,
      },
    },
  ]).exec();

  if (!aggregationResult.length) {
    console.error("Required data not found for stepStatusId:", stepStatusId);
    throw new Error("Required data not found for stepStatusId:" + stepStatusId);
  }

  
  const trigger = aggregationResult[0].visaStep.emailTriggers.filter(
    (trigger: EmailTrigger) => trigger.templateId === "dubai-admin-signature-submitted"
  );

  await sendApplicationUpdateEmails({
    triggers: [trigger],
    stepStatus: StepStatusEnum.SUBMITTED,
    visaType: aggregationResult[0].visaType.visaType,
    email: aggregationResult[0].user.email,
    firstName: aggregationResult[0].user.name,
  });

  await createLogForVisaApplication({
    triggers : aggregationResult[0].visaStep.logTriggers,
    clientName : aggregationResult[0].user.name,
    visaType : aggregationResult[0].visaType.visaType,
    stepName : aggregationResult[0].visaStep.stepName,
    stepStatus : moaStatusEnum.Sig_Uploaded, 
    doneBy : req.admin?.userName || req.user?.userName , 
    visaApplicationId : aggregationResult[0].visaApplicationId,
  })

  res.status(200).json({
    message: "Signature uploaded successfully.",
    signatureFile: moa.signatureFile,
    moaStatus: moa.status,
  });
};

// For common
export const fetchSigAndMOA = async (req: Request, res: Response) => {
  const { stepStatusId } = req.params;

  if (!stepStatusId) {
    throw new AppError("stepStatusId is required in params.", 400);
  }

  const moa = await moaModel.findOne({ stepStatusId });

  if (!moa) {
    return res.status(200).json({
      message: "MOA not uploaded yet",
      data: null,
    });
  }

  res.status(200).json({
    message: "MOA and Signature fetched successfully.",
    data: {
      moaDocument: moa.moaDocument,
      signatureFile: moa.signatureFile,
      moaStatus: moa.status,
    },
  });
};

// For Admin
export const approveSignature = async (req: Request, res: Response) => {
  const { stepStatusId } = req.body;

  if (!stepStatusId) {
    throw new AppError("stepStatusId is required in body.", 400);
  }

  const moa = await moaModel.findOne({ stepStatusId });

  if (!moa) {
    throw new AppError("MOA not found for the given stepStatusId.", 404);
  }

  if (!moa.signatureFile) {
    throw new AppError("No signature uploaded to approve.", 400);
  }

  moa.status = moaStatusEnum.Sig_Approved;
  await moa.save();

  const aggregationResult = await VisaApplicationStepStatusModel.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(stepStatusId) } },
    {
      $lookup: {
        from: "visasteps",
        localField: "stepId",
        foreignField: "_id",
        as: "visaStep",
      },
    },
    { $unwind: "$visaStep" },
    {
      $lookup: {
        from: "visatypes",
        localField: "visaTypeId",
        foreignField: "_id",
        as: "visaType",
      },
    },
    { $unwind: "$visaType" },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        visaApplicationId: 1,
        visaStepId: 1,
        visaTypeId: 1,
        userId: 1,
        "visaStep.emailTriggers": 1,
        "visaStep.logTriggers": 1,
        "visaStep.stepName": 1,
        "visaType.visaType": 1,
        "user.email": 1,
        "user.name": 1,
      },
    },
  ]).exec();

  const id = req.admin?.id;

  const userDoc = await UserModel
      .findById(id)
      .select("name")
      .lean();

  await createLogForVisaApplication({
    triggers : aggregationResult[0].visaStep.logTriggers,
    clientName : aggregationResult[0].user.name,
    adminName : userDoc?.name,
    visaType : aggregationResult[0].visaType.visaType,
    stepName : aggregationResult[0].visaStep.stepName,
    stepStatus : moaStatusEnum.Sig_Approved, 
    doneBy : req.admin?.userName || req.user?.userName ,
    visaApplicationId : aggregationResult[0].visaApplicationId,
  })

  res.status(200).json({
    message: "Signature approved successfully.",
    moaStatus: moa.status,
  });
};
