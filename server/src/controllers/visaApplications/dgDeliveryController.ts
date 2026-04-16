import { NextFunction, Request, Response } from "express";
import AppError from "../../utils/appError";
import { DgDeliveryModel } from "../../extraModels/dgDelivery";
import { DgShippingModel } from "../../extraModels/dgShipping";
import { UserModel  as userModel} from "../../models/Users";
import { VisaApplicationStepStatusModel } from "../../models/VisaApplicationStepStatus";
import mongoose from "mongoose";
import { sendApplicationUpdateEmails } from "../../services/emails/triggers/applicationTriggerSegregate/applicationTriggerSegregate";
import { StepStatusEnum } from "../../types/enums/enums";
import { createLogForVisaApplication } from "../../services/logs/triggers/visaApplications/createLogForVisaApplication"
// user karega
export const uploadDeliveryDetails = async (req: Request, res: Response) => {
  const { stepStatusId } = req.params;
  const {
    fullName,
    email,
    phoneNo,
    alternativePhoneNo,
    address,
    city,
    country,
    postalCode,
  } = req.body;

  const requiredFields = [
    "fullName",
    "email",
    "phoneNo",
    "address",
    "city",
    "country",
  ];
  const missingFields = requiredFields.filter((field) => !req.body[field]);

  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Missing required fields: ${missingFields.join(", ")}`,
    });
  }

  const delivery = new DgDeliveryModel({
    fullName,
    email,
    phoneNo,
    alternativePhoneNo,
    address,
    city,
    country,
    postalCode,
    stepStatusId,
  });

  const savedDelivery = await delivery.save();

  const emailData = await VisaApplicationStepStatusModel.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(stepStatusId) } },
    {
      $lookup: {
        from: "visaapplications", 
        localField: "visaApplicationId",
        foreignField: "_id",
        as: "visaApplication",
      },
    },
    { $unwind: "$visaApplication" },
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
        from: "visasteps", // Adjust based on your actual collection name
        localField: "stepId",
        foreignField: "_id",
        as: "step",
      },
    },
    { $unwind: "$step" },
    {
      $project: {
        _id: 1,
        "user.name": 1,
        "user.email": 1,
        "visaType.visaType": 1,
        "step.emailTriggers": 1,
        "step.logTriggers" : 1,
        "step.stepName" : 1,
        status: 1,
        visaApplicationId : 1
      },
    },
  ]);

  // Send email notification if email triggers are configured
  if (emailData.length > 0 && emailData[0].step.emailTriggers) {
    const { user, visaType, step, status ,visaApplicationId } = emailData[0];


    await sendApplicationUpdateEmails({
      triggers: step.emailTriggers,
      stepStatus: StepStatusEnum.SUBMITTED, 
      visaType: visaType.visaType,
      email: user.email,
      firstName: user.name
    });


    // write log 
    await createLogForVisaApplication({
      triggers : step.logTriggers,
      clientName : user.name,
      visaType: visaType.visaType, 
      stepName : step.stepName ,
      stepStatus: StepStatusEnum.SUBMITTED, 
      doneBy: req.admin?.userName || req.user?.userName ,
      visaApplicationId ,
    });
  }

  res.status(201).json({
    success: true,
    message: "Delivery details uploaded successfully",
    data: savedDelivery,
  });
};





// Admin karega
export const uploadShippingDetails = async (req: Request, res: Response) => {
  const { stepStatusId } = req.params;
  const { courierService, trackingNo, trackingUrl, email, phoneNo } = req.body;

  console.log(req.body);

  const shipping = new DgShippingModel({
    courierService,
    trackingNo,
    trackingUrl,
    supportInfo: {
      email,
      phoneNo,
    },
    stepStatusId,
  });

  const savedShipping = await shipping.save();

  const emailData = await VisaApplicationStepStatusModel.aggregate([
    { 
      $match: { _id: new mongoose.Types.ObjectId(stepStatusId) }
    },
    {
      $lookup: {
        from: "visaapplications", 
        localField: "visaApplicationId",
        foreignField: "_id",
        as: "visaApplication",
      },
    },
    { $unwind: "$visaApplication" },
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
        from: "visasteps", // Adjust based on your actual collection name
        localField: "stepId",
        foreignField: "_id",
        as: "step",
      },
    },
    { $unwind: "$step" },
    {
      $project: {
        _id: 1,
        "user.name": 1,
        "user.email": 1,
        "visaType.visaType": 1,
        "step.emailTriggers": 1,
        "step.logTriggers" : 1,
        "step.stepName" : 1,
        status: 1,
        visaApplicationId : 1
      },
    },
  ]);

  if (emailData.length > 0 && emailData[0].step.emailTriggers) {
    const { user, visaType, step, status ,visaApplicationId } = emailData[0];

    const id = req.admin?.id;

    const userDoc = await userModel
        .findById(id)
        .select("name")
        .lean();

    // Add log 
    await createLogForVisaApplication({
      triggers : step.logTriggers,
      clientName : user.name,
      adminName : req.admin?.userName,
      visaType: visaType.visaType, 
      stepName : step.stepName ,
      stepStatus: StepStatusEnum.APPROVED, 
      doneBy: req.admin?.userName || req.user?.userName ,
      visaApplicationId ,
    });
  }

  res.status(201).json({
    success: true,
    message: "Shipping details uploaded successfully",
    data: savedShipping,
  });
};

// isme authorizaAdmin nahi lagana , user&admin dono ke liye run karenge
export const fetchBothDetails = async (req: Request, res: Response) => {
  const { stepStatusId } = req.params;

  const deliveryDetails = await DgDeliveryModel.findOne({ stepStatusId });
  const shippingDetails = await DgShippingModel.findOne({ stepStatusId });

  res.status(200).json({
    success: true,
    message: "Fetched delivery and shipping details successfully",
    data: {
      delivery: deliveryDetails,
      shipping: shippingDetails,
    },
  });
};
