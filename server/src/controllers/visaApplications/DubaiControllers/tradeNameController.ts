import { NextFunction, Request, Response } from "express";
import AppError from "../../../utils/appError";
import { TradeNameModel } from "../../../extraModels/tradeNameModel";
import { StepStatusEnum, tradeNameStatus } from "../../../types/enums/enums";
import mongoose, { Types } from "mongoose";
import { sendApplicationUpdateEmails } from "../../../services/emails/triggers/applicationTriggerSegregate/applicationTriggerSegregate";
import { VisaApplicationStepStatusModel } from "../../../models/VisaApplicationStepStatus";
import { UserModel as userModel } from "../../../models/Users";
import { createLogForVisaApplication } from "../../../services/logs/triggers/visaApplications/createLogForVisaApplication";
// For user
export const uploadTradeNameOptions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { stepStatusId } = req.params;
  const { options } = req.body;

  if (!Array.isArray(options) || options.length !== 3) {
    return next(
      new AppError("Exactly 3 trade name options are required.", 400)
    );
  }

  const existing = await TradeNameModel.findOne({ stepStatusId });
  if (existing) {
    return next(
      new AppError(
        "Trade name options already uploaded for this stepStatusId.",
        400
      )
    );
  }


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
        "visaType.visaType": 1,
        "user.email": 1,
        "user.name": 1,
      },
    },
  ]).exec();

  console.log("Aggregation Result:", aggregationResult);

  if (!aggregationResult.length) {
    return next(new AppError("Required data not found", 404));
  }

  const data = aggregationResult[0];

  const tradeNameDoc = await TradeNameModel.create({
    stepStatusId,
    options,
    status: tradeNameStatus.TradeNames_Uploaded,
  });

  await sendApplicationUpdateEmails({
    triggers: data.visaStep.emailTriggers,
    stepStatus: StepStatusEnum.SUBMITTED,
    visaType: data.visaType.visaType,
    email: data.user.email,
    firstName: data.user.name,
  });

  await createLogForVisaApplication({
    triggers : data.visaStep.logTriggers,
    clientName : data.user.name,
    visaType : data.visaType.visaType,
    stepName : data.visaStep.stepName,
    stepStatus : tradeNameStatus.TradeNames_Uploaded , 
    doneBy : req.admin?.userName || req.user?.userName , 
    visaApplicationId : data.visaApplicationId,
  })

  res.status(201).json({
    message: "Trade name options uploaded successfully.",
    tradeNameDoc,
  });
};

// Admin side
export const fetchTradeNameOptions = async (req: Request, res: Response) => {
  const { stepStatusId } = req.params;

  const tradeNameDoc = await TradeNameModel.findOne({ stepStatusId });

  if (!tradeNameDoc) {
    res.status(404);
    throw new Error("Trade name options not found for this stepStatusId.");
  }

  return res.status(200).json({
    message: "Trade name options fetched successfully.",
    Options: tradeNameDoc.options,
  });
};

// Admin side
export const assignOneTradeName = async (req: Request, res: Response) => {
  const { stepStatusId } = req.params;
  const { assignedName } = req.body;

  if (!assignedName) {
    res.status(400);
    throw new Error("Assigned name is required.");
    return;
  }

  const tradeNameDoc = await TradeNameModel.findOneAndUpdate(
    { stepStatusId },
    { assignedName, status: tradeNameStatus.TradeName_Assigned },
    { new: true } 
  );

  if (!tradeNameDoc) {
    res.status(404);
    throw new Error("Trade name options not found for this stepStatusId.");
  }

  // data for calling log function
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
        visaStepId: 1,
        visaTypeId: 1,
        userId: 1,
        visaApplicationId : 1,
        "visaStep.emailTriggers": 1,
        "visaType.visaType": 1,
        "user.email": 1,
        "user.name": 1,
      },
    },
  ]).exec();

  const data = aggregationResult[0];

  const id = req.admin?.id;

  const userDoc = await userModel
      .findById(id)
      .select("name")
      .lean();

  await createLogForVisaApplication({
    triggers : data.visaStep.logTriggers,
    clientName : data.user.name,
    adminName :  userDoc?.name , 
    visaType : data.visaType.visaType,
    stepName : data.visaStep.stepName,
    stepStatus : tradeNameStatus.TradeName_Assigned , 
    doneBy : req.admin?.userName || req.user?.userName ,
    visaApplicationId : data.visaApplicationId,
  })

  return res.status(200).json({
    message: "Trade name assigned successfully.",
    tradeNameDoc,
  });
};

// For user
export const sendChangeRequest = async (req: Request, res: Response) => {
  const { stepStatusId } = req.params;
  const { options, reasonOfChange } = req.body;

  // Validate that exactly 3 options are provided
  if (!Array.isArray(options) || options.length !== 3) {
    res.status(400);
    throw new Error("Exactly 3 trade name options are required.");
  }

  // Check that reasonOfChange is provided
  if (!reasonOfChange) {
    res.status(400);
    throw new Error("Reason for change is required.");
  }

  // Find and update the document
  const tradeNameDoc = await TradeNameModel.findOneAndUpdate(
    { stepStatusId },
    { options, reasonOfChange, status: tradeNameStatus.ChangeReq_Sent },
    { new: true } // Return the updated document
  );

  if (!tradeNameDoc) {
    res.status(404);
    throw new Error("Trade name options not found for this stepStatusId.");
  }


  // data for calling log function
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
        visaStepId: 1,
        visaTypeId: 1,
        userId: 1,
        visaApplicationId : 1,
        "visaStep.emailTriggers": 1,
        "visaType.visaType": 1,
        "user.email": 1,
        "user.name": 1,
      },
    },
  ]).exec();

  const data = aggregationResult[0];

  await createLogForVisaApplication({
    triggers : data.visaStep.logTriggers,
    clientName : data.user.name,
    visaType : data.visaType.visaType,
    stepName : data.visaStep.stepName,
    stepStatus : tradeNameStatus.ChangeReq_Sent , 
    doneBy : req.admin?.userName || req.user?.userName ,
    visaApplicationId : data.visaApplicationId,
  })

  return res.status(200).json({
    message: "Trade name options changed successfully.",
    tradeNameDoc,
  });
};

// For Admin
export const approveChangeReq = async (req: Request, res: Response) => {
  const { stepStatusId } = req.params;
  const { assignedName } = req.body;

  if (!assignedName) {
    res.status(400);
    throw new Error("Assigned name is required.");
  }

  // Find the document first to validate assignedName
  const tradeNameDoc = await TradeNameModel.findOne({ stepStatusId });

  if (!tradeNameDoc) {
    res.status(404);
    throw new Error("Trade name options not found for this stepStatusId.");
  }

  // Update the document
  tradeNameDoc.assignedName = assignedName;
  tradeNameDoc.status = tradeNameStatus.ChangeReq_Approved;
  await tradeNameDoc.save();

  // data for calling log function
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
        visaStepId: 1,
        visaTypeId: 1,
        userId: 1,
        visaApplicationId : 1,
        "visaStep.emailTriggers": 1,
        "visaType.visaType": 1,
        "user.email": 1,
        "user.name": 1,
      },
    },
  ]).exec();

  const data = aggregationResult[0];

  const id = req.admin?.id;

  const userDoc = await userModel
      .findById(id)
      .select("name")
      .lean();

  await createLogForVisaApplication({
    triggers : data.visaStep.logTriggers,
    clientName : data.user.name,
    adminName : userDoc?.name,
    visaType : data.visaType.visaType,
    stepName : data.visaStep.stepName,
    stepStatus : tradeNameStatus.ChangeReq_Approved , 
    doneBy : req.admin?.userName || req.user?.userName , 
    visaApplicationId : data.visaApplicationId,
  })

  return res.status(200).json({
    message: "Trade name change approved and assigned successfully.",
    tradeNameDoc,
  });
};

// For Admin
export const rejectChangeReq = async (req: Request, res: Response) => {
  const { stepStatusId } = req.params;

  const tradeNameDoc = await TradeNameModel.findOneAndUpdate(
    { stepStatusId },
    { reasonOfChange: null, status: tradeNameStatus.ChangeReq_Rejected },
    { new: true }
  );

  if (!tradeNameDoc) {
    res.status(404);
    throw new Error("Trade name options not found for this stepStatusId.");
  }

  // data for calling log function
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
        visaStepId: 1,
        visaTypeId: 1,
        userId: 1,
        visaApplicationId : 1,
        "visaStep.emailTriggers": 1,
        "visaType.visaType": 1,
        "user.email": 1,
        "user.name": 1,
      },
    },
  ]).exec();

  const data = aggregationResult[0];

  const id = req.admin?.id;

  const userDoc = await userModel
      .findById(id)
      .select("name")
      .lean();

  await createLogForVisaApplication({
    triggers : data.visaStep.logTriggers,
    clientName : data.user.name,
    adminName : userDoc?.name,
    visaType : data.visaType.visaType,
    stepName : data.visaStep.stepName,
    stepStatus : tradeNameStatus.ChangeReq_Rejected , 
    doneBy : req.admin?.userName || req.user?.userName , 
    visaApplicationId : data.visaApplicationId,
  })

  return res.status(200).json({
    message: "Trade name change request rejected successfully.",
    tradeNameStatus: tradeNameDoc.status,
  });
};

// For user
export const fetchAssignedTradeName = async (req: Request, res: Response) => {
  const { stepStatusId } = req.params;

  const tradeNameDoc = await TradeNameModel.findOne(
    { stepStatusId },
    { assignedName: 1, _id: 0 }
  );

  if (!tradeNameDoc || !tradeNameDoc.assignedName) {
    res.status(404);
    throw new Error("Final trade name not found or not assigned yet.");
  }

  return res.status(200).json({
    message: "Final trade name fetched successfully.",
    assignedName: tradeNameDoc.assignedName,
  });
};

// for common
export const fetchTradeNameInfo = async (req: Request, res: Response) => {
  const { stepStatusId } = req.params;

  const tradeName = await TradeNameModel.findOne(
    { stepStatusId },
    { options: 1, assignedName: 1, status: 1, reasonOfChange: 1 }
  );

  if (!tradeName) {
    return res
      .status(200)
      .json({
        success: false,
        message: "Preferences Not Submitted",
        data: null,
      });
  }

  res.status(200).json({
    success: true,
    data: {
      options: tradeName.options,
      assignedName: tradeName.assignedName,
      status: tradeName.status,
      reasonOfChange: tradeName.reasonOfChange,
    },
  });
};

// return wala case bhi dekhna hai ....
