import { NextFunction, Request, Response } from "express";
import AppError from "../../utils/appError";
import { VisaApplicationModel as visaApplicationModel } from "../../models/VisaApplication";
import {
  VisaStepModel as stepModel,
  VisaStepModel,
} from "../../models/VisaStep";
import { VisaApplicationStepStatusModel as stepStatusModel } from "../../models/VisaApplicationStepStatus";
import { VisaStepRequirementModel as reqModel } from "../../models/VisaStepRequirement";
import { VisaApplicationReqStatusModel as reqStatusModel } from "../../models/VisaApplicationReqStatus";
import { UserModel } from "../../models/Users";
import { VisaTypeModel } from "../../models/VisaType";
import { aimaModel } from "../../extraModels/aimaModel";
import {
  visaApplicationReqStatusEnum,
  StepStatusEnum,
  aimaStatusEnum,
  StepTypeEnum,
  VisaApplicationStatusEnum,
} from "../../types/enums/enums";
import { sendApplicationUpdateEmails } from "../../services/emails/triggers/applicationTriggerSegregate/applicationTriggerSegregate";
import mongoose from "mongoose";
// import log
import { createLogForVisaApplication } from "../../services/logs/triggers/visaApplications/createLogForVisaApplication";

// Approve click on step
export const approveStep = async (req: Request, res: Response) => {
  const { visaApplicationId } = req.params;

  if (!visaApplicationId) {
    return res.status(400).json({ error: "visaApplicationId is required." });
  }

  const appData = await visaApplicationModel.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(visaApplicationId) } },
    {
      $lookup: {
        from: "users", // assuming collection name
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $lookup: {
        from: "visatypes", // assuming collection name
        localField: "visaTypeId",
        foreignField: "_id",
        as: "visaType",
      },
    },
    { $unwind: "$visaType" },
    {
      $lookup: {
        from: "visasteps", // assuming collection name
        let: { visaTypeId: "$visaTypeId", currentStep: "$currentStep" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$visaTypeId", "$$visaTypeId"] },
                  { $eq: ["$stepNumber", "$$currentStep"] },
                ],
              },
            },
          },
        ],
        as: "currentStepDoc",
      },
    },
    { $unwind: "$currentStepDoc" },
    {
      $lookup: {
        from: "visaapplicationstepstatuses", // assuming collection name
        let: {
          stepId: "$currentStepDoc._id",
          visaAppId: "$_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$stepId", "$$stepId"] },
                  { $eq: ["$visaApplicationId", "$$visaAppId"] },
                ],
              },
            },
          },
        ],
        as: "currentStepStatusDoc",
      },
    },
    { $unwind: "$currentStepStatusDoc" },
    {
      $lookup: {
        from: "visasteps", // assuming collection name
        let: {
          visaTypeId: "$visaTypeId",
          nextStep: { $add: ["$currentStep", 1] },
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$visaTypeId", "$$visaTypeId"] },
                  { $eq: ["$stepNumber", "$$nextStep"] },
                ],
              },
            },
          },
        ],
        as: "nextStepDoc",
      },
    },
    {
      $project: {
        _id: 1,
        userId: 1,
        visaTypeId: 1,
        currentStep: 1,
        "user.name": 1,
        "user.email": 1,
        "visaType.visaType": 1,
        currentStepDoc: 1,
        currentStepStatusDoc: 1,
        nextStepDoc: { $arrayElemAt: ["$nextStepDoc", 0] },
      },
    },
  ]);

  if (!appData.length) {
    return res
      .status(404)
      .json({ error: "Visa Application or related data not found." });
  }

  const data = appData[0];

  await reqStatusModel.updateMany(
    {
      visaApplicationId,
      stepId: data.currentStepDoc._id,
    },
    {
      $set: {
        status: visaApplicationReqStatusEnum.VERIFIED,
      },
    }
  );

  // update status of current step
  await stepStatusModel.findByIdAndUpdate(data.currentStepStatusDoc._id, {
    $set: { status: StepStatusEnum.APPROVED },
  });

  console.log(data);

  if (data.currentStepDoc.emailTriggers) {
    await sendApplicationUpdateEmails({
      triggers: data.currentStepDoc.emailTriggers,
      stepStatus: StepStatusEnum.APPROVED,
      visaType: data.visaType.visaType,
      email: data.user.email,
      firstName: data.user.name,
    });
  }

  console.log("Log Triggers", data.currentStepDoc.logTriggers);

  // For log Triggers
  if (data.currentStepDoc.logTriggers) {
    const res = await createLogForVisaApplication({
      triggers: data.currentStepDoc.logTriggers,
      clientName: data.user.name,
      visaType: data.visaType.visaType,
      stepName: data.currentStepDoc.stepName,
      stepStatus: StepStatusEnum.APPROVED,
      adminName: req.admin?.userName,
      doneBy: req.admin?.userName,
      visaApplicationId: new mongoose.Types.ObjectId(visaApplicationId),
    });
    console.log("Log resposne", res);
  }

  // add condition for mark visaApplication as Completed
  if (!data.nextStepDoc) {
    await visaApplicationModel.findByIdAndUpdate(visaApplicationId, {
      $set: { status: VisaApplicationStatusEnum.COMPLETED },
    });
    return res.status(200).json({
      message: "Step approved , and visaApp marked as COMPLETED.",
    });
  }

  const newStepStatusDoc = await stepStatusModel.create({
    userId: data.userId,
    visaTypeId: data.visaTypeId,
    stepId: data.nextStepDoc._id,
    visaApplicationId,
    status: StepStatusEnum.IN_PROGRESS,
    reqFilled: {},
  });

  if (data.nextStepDoc.stepType === StepTypeEnum.AIMA) {
    const phases = [
      aimaStatusEnum.Application_Approved,
      aimaStatusEnum.Appointment_Confirmed,
      aimaStatusEnum.Visa_Approved,
      aimaStatusEnum.Appointment_Scheduled,
    ];

    await aimaModel.insertMany(
      phases.map((status) => ({
        aimaStatus: status,
        isCompleted: false,
        completedOn: null,
        aimaNumber: null,
        stepStatusId: newStepStatusDoc._id,
      }))
    );
  }

  const nextRequirements = await reqModel
    .find({
      visaTypeId: data.visaTypeId,
      visaStepId: data.nextStepDoc._id,
    })
    .lean();

  if (nextRequirements.length > 0) {
    await reqStatusModel.insertMany(
      nextRequirements.map((reqItem) => ({
        userId: data.userId,
        visaTypeId: data.visaTypeId,
        visaApplicationId,
        reqId: reqItem._id,
        stepId: data.nextStepDoc._id,
        stepStatusId: newStepStatusDoc._id,
        status: visaApplicationReqStatusEnum.NOT_UPLOADED,
        value: null,
        reason: null,
      }))
    );
  }

  return res.status(200).json({
    message: "Step approved and next step entries are done",
    nextStepStatus: newStepStatusDoc,
  });
};

// Reject click on step
export const rejectStep = async (req: Request, res: Response) => {
  const { visaApplicationId } = req.params;

  if (!visaApplicationId) {
    return res.status(400).json({ error: "visaApplicationId is required." });
  }

  // Get Visa Application
  const visaApp = await visaApplicationModel.findById(visaApplicationId);
  if (!visaApp) {
    return res.status(404).json({ error: "Visa Application not found." });
  }

  const { currentStep, visaTypeId, userId } = visaApp;

  // 1. Get step for currentStep
  const currentStepDoc = await stepModel.findOne({
    visaTypeId,
    stepNumber: currentStep,
  });

  if (!currentStepDoc) {
    return res.status(404).json({ error: "Current Step not found." });
  }

  // 3. Update stepStatus to Rejected
  const stepStatusDoc = await stepStatusModel.findOneAndUpdate(
    {
      visaApplicationId,
      stepId: currentStepDoc._id,
    },
    {
      $set: { status: StepStatusEnum.REJECTED },
    },
    {
      new: true, // return the updated document
    }
  );

  return res.status(200).json({
    message: "Step rejected",
    stepStatusDoc,
  });
};

// verified (requirement)
// *******Note***** (reason ko bhi null ya empty karna padega )
export const markAsVerified = async (req: Request, res: Response) => {
  const { reqStatusId } = req.params;

  if (!reqStatusId) {
    return res.status(400).json({ error: "reqStatusId is required." });
  }

  const updatedStatus = await reqStatusModel.findByIdAndUpdate(
    reqStatusId,
    { $set: { status: visaApplicationReqStatusEnum.VERIFIED } },
    { new: true }
  );

  if (!updatedStatus) {
    return res.status(404).json({ error: "Request Status not found." });
  }

  return res.status(200).json({
    message: "Request marked as Verified.",
    data: updatedStatus,
  });
};

// Needs Reupload (requirement) updated the trim part-Aditya!!!
export const needsReupload = async (req: Request, res: Response) => {
  const { reqStatusId } = req.params;
  let { reason } = req.body;
  console.log(req.body);

  console.log("_________Reason________ ", reason);
  if (!reqStatusId) {
    return res.status(400).json({ error: "reqStatusId is required." });
  }

  if (typeof reason === "string") {
    reason = reason.trim() === "" ? null : reason;
  } else {
    reason = null;
  }

  const updatedStatus = await reqStatusModel.findByIdAndUpdate(
    reqStatusId,
    {
      $set: {
        status: visaApplicationReqStatusEnum.RE_UPLOAD,
        reason: reason,
      },
    },
    { new: true }
  );

  if (!updatedStatus) {
    return res.status(404).json({ error: "Request Status not found." });
  }

  return res.status(200).json({
    message: "Marked as 'Needs Reupload'",
    data: updatedStatus,
  });
};
