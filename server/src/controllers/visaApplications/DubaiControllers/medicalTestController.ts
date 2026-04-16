import { NextFunction, Request, Response } from "express";
import AppError from "../../../utils/appError";
import { MedicalTestModel } from "../../../extraModels/medicalTestModel";
import { medicalTestStatus, StepStatusEnum } from "../../../types/enums/enums";
import mongoose, { Types } from "mongoose";
import { EmailTrigger } from "../../../models/VisaStep";
import { sendApplicationUpdateEmails } from "../../../services/emails/triggers/applicationTriggerSegregate/applicationTriggerSegregate";
import { VisaApplicationStepStatusModel } from "../../../models/VisaApplicationStepStatus";
import { createLogForVisaApplication } from "../../../services/logs/triggers/visaApplications/createLogForVisaApplication";
import { UserModel } from "../../../models/Users";

// For Admin
export const uploadMedicalTestDetails = async (req: Request, res: Response) => {
  const { stepStatusId } = req.params;
  const { date, time, hospitalName, address, contactNumber } = req.body;

  const updatedTest = await MedicalTestModel.findOneAndUpdate(
    { stepStatusId },
    {
      date,
      time,
      hospitalName,
      address,
      contactNumber,
      status: medicalTestStatus.Scheduled,
    },
    {
      new: true, // return the updated document
      upsert: true, // create a new one if it doesn't exist
      setDefaultsOnInsert: true,
    }
  );
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


  await sendApplicationUpdateEmails({
    triggers: aggregationResult[0].visaStep.emailTriggers,
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
    stepStatus : medicalTestStatus.Scheduled, 
    doneBy : req.admin?.userName || req.user?.userName ,
    visaApplicationId : aggregationResult[0].visaApplicationId,
  });

  return res.status(200).json({
    message: "Medical test added successfully",
    doc: updatedTest,
  });
};

// For Admin
export const markTestAsCompleted = async (req: Request, res: Response) => {
  const { stepStatusId } = req.params;

  const test = await MedicalTestModel.findOne({ stepStatusId });

  if (!test) {
    return res
      .status(404)
      .json({ message: "Medical test not found for the given stepStatusId" });
  }

  test.status = medicalTestStatus.Completed;
  await test.save();

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
    stepStatus : medicalTestStatus.Completed, 
    doneBy : req.admin?.userName || req.user?.userName ,
    visaApplicationId : aggregationResult[0].visaApplicationId,
  });

  res.status(200).json({
    message: "Medical test marked as completed",
    updatedDoc: test,
  });
};




// For User
export const sendReschedulingReq = async (req: Request, res: Response) => {
  const { stepStatusId } = req.params;
  const { reason} = req.body;

  const test = await MedicalTestModel.findOne({ stepStatusId });

  if(!reason){
    return res.status(400).json({ message: "Reason for reschedule is required" });
  }

  if (!test) {
    return res
      .status(404)
      .json({ message: "Medical test not found for the given stepStatusId" });
  }

  // Prevent reschedule if already requested or if already completed
  if (
    test.status === medicalTestStatus.RescheduleReq_Sent ||
    test.status === medicalTestStatus.Completed
  ) {
    return res.status(400).json({
      message:
        test.status === medicalTestStatus.Completed
          ? "Cannot reschedule a completed test"
          : "Reschedule request already sent",
    });
  }

  test.status = medicalTestStatus.RescheduleReq_Sent;
  test.rescheduleReason = reason;
  await test.save();

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

  await createLogForVisaApplication({
    triggers : aggregationResult[0].visaStep.logTriggers,
    clientName : aggregationResult[0].user.name,
    visaType : aggregationResult[0].visaType.visaType,
    stepName : aggregationResult[0].visaStep.stepName,
    stepStatus : medicalTestStatus.RescheduleReq_Sent, 
    doneBy : req.admin?.userName || req.user?.userName , 
    visaApplicationId : aggregationResult[0].visaApplicationId,
  });

  res.status(200).json({
    message: "Reschedule request sent successfully",
    updatedDoc: test,
  });
};

// For Admin
export const approveReschedulingReq = async (req: Request, res: Response) => {
  const { stepStatusId } = req.params;
  const { date, time, hospitalName, address, contactNumber } = req.body;
  const test = await MedicalTestModel.findOne({ stepStatusId });

  if (!test) {
    return res
      .status(404)
      .json({ message: "Medical test not found for the given stepStatusId" });
  }

  if (
    test.status !== medicalTestStatus.RescheduleReq_Sent ||
    !test.rescheduleReason
  ) {
    return res
      .status(400)
      .json({ message: "No reschedule request found to approve" });
  }

  // Update with the new date and time
  test.date = date; // If null, retain original date
  test.time = time;
  test.hospitalName = hospitalName;
  test.address=address;
  test.contactNumber=contactNumber; // If null, retain original time
  test.status = medicalTestStatus.RescheduleReq_Approved;

  await test.save();



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
    stepStatus : medicalTestStatus.RescheduleReq_Approved, 
    doneBy : req.admin?.userName || req.user?.userName ,
    visaApplicationId : aggregationResult[0].visaApplicationId,
  });

  res.status(200).json({
    message: "Reschedule request approved and test details updated",
    updatedDoc: test,
  });
};

// For Admin
export const rejectReschedulingReq = async (req: Request, res: Response) => {
  const { stepStatusId } = req.params;

  const test = await MedicalTestModel.findOneAndUpdate(
    {
      stepStatusId,
      status: medicalTestStatus.RescheduleReq_Sent, // only update if this status is set
    },
    {
      status: medicalTestStatus.RescheduleReq_Rejected,
      requestedSlot: null,
    },
    { new: true } // return updated doc
  );

  if (!test) {
    return res.status(400).json({
      message:
        "Either medical test not found or no reschedule request was sent",
    });
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
    stepStatus : medicalTestStatus.RescheduleReq_Rejected, 
    doneBy : req.admin?.userName || req.user?.userName ,
    visaApplicationId : aggregationResult[0].visaApplicationId,
  });

  res.status(200).json({
    message: "Reschedule request rejected successfully",
    data: test,
  });
};

// For Common
export const fetchMedicalTestInfo = async (req: Request, res: Response) => {
  const { stepStatusId } = req.params;

  const test = await MedicalTestModel.findOne({ stepStatusId });

  if (!test) {
    return res
      .status(200)
      .json({ message: "No medical test found", data: null });
  }

  return res.status(200).json({
    message: "Medical test details fetched successfully",
    data: {
      medicalInfo: test,
    },
  });
};

// return wala case bhi dekhna hai ....
