import { NextFunction, Request, Response } from "express";
import AppError from "../../utils/appError";
import { VisaApplicationModel as visaApplicationModel } from "../../models/VisaApplication";
import { VisaStepModel as stepModel } from "../../models/VisaStep";
import { aimaModel } from "../../extraModels/aimaModel";
import { VisaApplicationStepStatusModel as stepStatusModel } from "../../models/VisaApplicationStepStatus";
import { VisaStepRequirementModel as reqModel } from "../../models/VisaStepRequirement";
import { VisaApplicationReqStatusModel as reqStatusModel } from "../../models/VisaApplicationReqStatus";
import {
  visaApplicationReqStatusEnum,
  StepStatusEnum,
  DocumentSourceEnum,
  StepTypeEnum,
} from "../../types/enums/enums";
import { getDgInvestmentStepResponse } from "./exceptionUtility";
import { VisaTypeModel } from "../../models/VisaType";
import mongoose, { Types } from "mongoose";
import { sendApplicationUpdateEmails } from "../../services/emails/triggers/applicationTriggerSegregate/applicationTriggerSegregate";
import { deleteImageFromS3 } from "../../services/s3Upload";
// import log function 
import { createLogForVisaApplication } from "../../services/logs/triggers/visaApplications/createLogForVisaApplication"

export const getCurrentStepInfo = async (req: Request, res: Response) => {
  console.log(`getCurrentStepInfo api hit`);
  const { visaApplicationId } = req.params;

  if (!visaApplicationId) {
    return res.status(400).json({ error: "visaApplicationId is required" });
  }

  // Fetch the visa application to get visaTypeId and currentStep
  const visaApplication =
    await visaApplicationModel.findById(visaApplicationId);
  if (!visaApplication) {
    return res.status(404).json({ error: "Visa Application not found" });
  }

  const { visaTypeId, currentStep } = visaApplication;

  // fetch visaTypeName from visaTypeDoc
  const visaType = await VisaTypeModel.findById(visaTypeId);
  const visaTypeName = visaType?.visaType || "Unknown";

  const allSteps = await stepModel.find({ visaTypeId }).sort({ stepNumber: 1 }); // sort by step order
  const stepNames = allSteps.map((step) => step.stepName);

  // Get total steps for this visaType
  const totalSteps = await stepModel.countDocuments({ visaTypeId });

  // Get the current step based on visaTypeId and currentStep
  const step = await stepModel.findOne({ visaTypeId, stepNumber: currentStep });
  if (!step) {
    return res
      .status(404)
      .json({ error: "Step not found for this visa type and step number" });
  }

  const currentStepName = step.stepName;
  // prepare the common  things needed
  const commonInfo = {
    visaTypeName,
    currentStepName,
    totalSteps,
    currentStepNumber: currentStep,
    stepNames,
    stepType: step.stepType,
  };

  const { stepType } = step;

  const visaStepId = step._id;

  console.log(visaApplicationId, visaStepId);
  // Get the dynamic step status
  const stepStatusDoc = await stepStatusModel.findOne({
    visaApplicationId,
    stepId: visaStepId,
  });

  // Get static requirements of the step
  const requirements = await reqModel.find({ visaStepId: visaStepId });

  // console.log("Fetched requirements:", requirements);

  // Get dynamic requirement statuses
  const reqStatusList = await reqStatusModel.find({
    visaApplicationId,
    stepId: visaStepId,
  });

  // ***reqList empty aa gayi *****
  // handle here ...

  // handle when domiGrena
  const stepStatusId = stepStatusDoc?._id as Types.ObjectId;

  // We have to handle this condition differently
  if (!stepStatusId) {
    return res.status(400).json({ message: "Missing stepStatusId." });
  }

  if (stepType == StepTypeEnum.DGINVESTMENT) {
    const response = await getDgInvestmentStepResponse({ stepStatusId });
    // directly return this response
    return res.status(response.statusCode).json({
      response,
      commonInfo,
      stepData: {
        stepType: step.stepType,
        currentStepStatusId: stepStatusId,
        inProgressMessage: step.inProgressMessage || "",
        stepStatus: stepStatusDoc?.status || "IN_PROGRESS",
        stepSource: step.stepSource,
        dgInvestmentData: response.dgInvestmentData,
      },
    });
  }

  // Handle AIMA Case
  if (stepType === StepTypeEnum.AIMA) {
    console.log("StepstatusId", stepStatusId);
    const aimaDocs = await aimaModel.find({
      stepStatusId: new mongoose.Types.ObjectId(stepStatusId),
    });

    return res.status(200).json({
      message: "AIMA documents fetched successfully",
      commonInfo,
      stepData: {
        stepType: step.stepType,
        inProgressMessage: step.inProgressMessage || "",
        stepStatus: stepStatusDoc?.status || "IN_PROGRESS",
        aimaDocs,
        stepSource: step.stepSource,
      },
    });
  }

  // Create a map for quick access
  const reqStatusMap = new Map();
  // reqId : reqStatus
  reqStatusList.forEach((status) => {
    reqStatusMap.set(status.reqId.toString(), status);
  });

  // function for building response of a particular requirement...
  const formattedRequirements = requirements.map((req: any) => {
    const statusDoc = reqStatusMap.get(req._id.toString());
    return {
      reqStatusId: statusDoc?._id || null,
      question: req.question,
      requirementType: req.requirementType,
      reqCategory: req.reqCategory,
      options: req.options || [],
      required: req.required,
      reqStatus: statusDoc?.status || visaApplicationReqStatusEnum.NOT_UPLOADED,
      reason: statusDoc?.reason || null,
      value: statusDoc?.value || null,
    };
  });

  return res.status(200).json({
    commonInfo,
    stepData: {
      currentStepStatusId: stepStatusId,
      currentStepNumber: currentStep,
      stepType: step.stepType,
      inProgressMessage: step.inProgressMessage || "",
      stepSource: step.stepSource,
      stepStatus: stepStatusDoc?.status || "IN_PROGRESS",
      requirements: formattedRequirements,
    },
  });
};

// upload document
export const uploadDocument = async (req: Request, res: Response) => {
  const { reqStatusId } = req.params;

  if (!reqStatusId || reqStatusId === "null" || reqStatusId === "undefined") {
    res.status(400).json({ error: "Requirement Status ID is required." });
    return;
  }

  // Check if file or value is present
  const file = req.file;
  const { value } = req.body;

  if (!file && !value) {
    res.status(400).json({ error: "Either a file or value must be provided." });
    return;
  }

  // Find the reqStatusDoc
  const reqStatusDoc = await reqStatusModel.findById(reqStatusId);
  if (!reqStatusDoc) {
    res.status(404).json({ error: "Requirement status not found." });
    return;
  }

  //  Authorization check based on stepSource
  const step = await stepModel.findById(reqStatusDoc.stepId);
  if (!step) {
    return res.status(500).json({ error: "Associated step not found." });
  }

  const stepSource = step.stepSource;

  if (
    (stepSource === DocumentSourceEnum.USER && !req.user) ||
    (stepSource === DocumentSourceEnum.ADMIN && !req.admin)
  ) {
    return res.status(403).json({
      error: "You are not authorized to upload document for this step.",
    });
  }

  // If a file is uploaded, save S3 URL
  if (file) {
    reqStatusDoc.value = (file as any).location; // S3 URL
    console.log(`reqStatus update ho gaya :`, reqStatusDoc.value);
  } else {
    reqStatusDoc.value = value;
  }

  reqStatusDoc.status = visaApplicationReqStatusEnum.UPLOADED;
  reqStatusDoc.reason = null; // Optional: clear previous rejection reason

  await reqStatusDoc.save();

  // also update that map
  // Fetch related requirement to check if it's "required"
  const requirement = await reqModel.findById(reqStatusDoc.reqId);
  if (!requirement) {
    return res.status(500).json({ error: "Related requirement not found." });
  }

  // If required, update `reqFilled` map in step status doc
  if (requirement.required) {
    const stepStatusDoc = await stepStatusModel.findOne({
      visaApplicationId: reqStatusDoc.visaApplicationId,
      stepId: reqStatusDoc.stepId,
    });

    if (stepStatusDoc) {
      stepStatusDoc.reqFilled.set(reqStatusDoc.reqId.toString(), true);
      await stepStatusDoc.save();
    }
  }

  res.status(200).json({
    message: "Document uploaded successfully.",
    updatedStatus: reqStatusDoc,
  });
  return;
};

export const removeDocument = async (req: Request, res: Response) => {
  const { reqStatusId } = req.params;

  if (!reqStatusId || reqStatusId === "null" || reqStatusId === "undefined") {
    res.status(400).json({ error: "Requirement Status ID is required." });
    return;
  }

  try {
    const reqStatusDoc = await reqStatusModel.findById(reqStatusId);
    if (!reqStatusDoc) {
      res.status(404).json({ error: "Requirement status not found." });
      return;
    }

    if (!reqStatusDoc.value) {
      res.status(400).json({ error: "No document found to remove." });
      return;
    }

    const step = await stepModel.findById(reqStatusDoc.stepId);
    if (!step) {
      return res.status(500).json({ error: "Associated step not found." });
    }

    const stepSource = step.stepSource;
    if (
      (stepSource === DocumentSourceEnum.USER && !req.user) ||
      (stepSource === DocumentSourceEnum.ADMIN && !req.admin)
    ) {
      return res.status(403).json({
        error: "You are not authorized to remove document for this step.",
      });
    }

    const currentValue = String(reqStatusDoc.value);
    const isS3Url =
      currentValue.includes(".s3.") || currentValue.includes("amazonaws.com");

    if (isS3Url) {
      try {
        await deleteImageFromS3(currentValue);
        console.log(`Document deleted from S3: ${currentValue}`);
      } catch (error) {
        console.error("Error deleting document from S3:", error);
      }
    }

    reqStatusDoc.value = null;
    reqStatusDoc.status = visaApplicationReqStatusEnum.NOT_UPLOADED;
    reqStatusDoc.reason = null;
    await reqStatusDoc.save();

    const requirement = await reqModel.findById(reqStatusDoc.reqId);
    if (!requirement) {
      return res.status(500).json({ error: "Related requirement not found." });
    }

    if (requirement.required) {
      const stepStatusDoc = await stepStatusModel.findOne({
        visaApplicationId: reqStatusDoc.visaApplicationId,
        stepId: reqStatusDoc.stepId,
      });

      if (stepStatusDoc) {
        stepStatusDoc.reqFilled.set(reqStatusDoc.reqId.toString(), false);
        await stepStatusDoc.save();
        console.log(
          `Updated reqFilled map for stepStatus: ${stepStatusDoc._id}`
        );
      }
    }

    res.status(200).json({
      message: "Document removed successfully.",
      updatedStatus: reqStatusDoc,
    });
    return;
  } catch (error) {
    console.error("Error removing document:", error);
    res.status(500).json({
      error: "An error occurred while removing the document.",
      details: error instanceof Error ? error.message : "Unknown error",
    });
    return;
  }
};

export const submitRequirements = async (req: Request, res: Response) => {
  const { requirements } = req.body;

  if (
    !requirements ||
    !Array.isArray(requirements) ||
    requirements.length === 0
  ) {
    return res
      .status(400)
      .json({ error: "Requirements array is required and must not be empty." });
  }

  const updateResults = [];
  const errors = [];

  for (const requirement of requirements) {
    try {
      const { reqStatusId, value } = requirement;

      if (!reqStatusId) {
        errors.push(`Missing reqStatusId for: ${JSON.stringify(requirement)}`);
        continue;
      }

      if (value === undefined) {
        errors.push(`Missing value for requirement with ID: ${reqStatusId}`);
        continue;
      }

      const reqStatusDoc = await reqStatusModel.findById(reqStatusId);
      if (!reqStatusDoc) {
        errors.push(`Requirement status not found for ID: ${reqStatusId}`);
        continue;
      }

      const step = await stepModel.findById(reqStatusDoc.stepId);
      if (!step) {
        errors.push(
          `Associated step not found for requirement: ${reqStatusId}`
        );
        continue;
      }

      const stepSource = step.stepSource;
      if (
        (stepSource === DocumentSourceEnum.USER && !req.user) ||
        (stepSource === DocumentSourceEnum.ADMIN && !req.admin)
      ) {
        errors.push(`Not authorized to submit requirement: ${reqStatusId}`);
        continue;
      }

      reqStatusDoc.value = value;
      reqStatusDoc.status = visaApplicationReqStatusEnum.UPLOADED;
      await reqStatusDoc.save();

      const relatedRequirement = await reqModel.findById(reqStatusDoc.reqId);
      if (!relatedRequirement) {
        errors.push(`Related requirement not found for ID: ${reqStatusId}`);
        continue;
      }

      if (relatedRequirement.required) {
        const stepStatusDoc = await stepStatusModel.findOne({
          visaApplicationId: reqStatusDoc.visaApplicationId,
          stepId: reqStatusDoc.stepId,
        });

        if (stepStatusDoc) {
          stepStatusDoc.reqFilled.set(reqStatusDoc.reqId.toString(), true);
          await stepStatusDoc.save();
        }
      }

      updateResults.push({
        reqStatusId,
        success: true,
        message: "Requirement submitted successfully",
      });
    } catch (err: any) {
      console.error(
        `Error processing requirement: ${JSON.stringify(requirement)}`,
        err
      );
      errors.push(
        `Unhandled error for reqStatusId ${requirement?.reqStatusId || "unknown"}`
      );
    }
  }

  return res.status(200).json({
    message: "Requirements processing completed",
    processed: requirements.length,
    successful: updateResults.length,
    failed: errors.length,
    results: updateResults,
    errors: errors.length > 0 ? errors : undefined,
  });
};

// submit step
export const stepSubmit = async (req: Request, res: Response) => {
  const { visaApplicationId } = req.params;

  if (!visaApplicationId) {
    return res.status(400).json({ error: "visaApplicationId is required." });
  }

  console.log("visaApplicationId", visaApplicationId);

  const appData = await visaApplicationModel.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(visaApplicationId) } },
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
        from: "visaapplicationstepstatuses",
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
      },
    },
  ]);

  if (!appData.length) {
    return res
      .status(404)
      .json({ error: "Visa Application or related data not found." });
  }

  const data = appData[0];

  const reqFilledObj =
    data.currentStepStatusDoc.reqFilled instanceof Map
      ? Object.fromEntries(data.currentStepStatusDoc.reqFilled)
      : data.currentStepStatusDoc.reqFilled;

  const allFilled = Object.values(reqFilledObj).every((val) => val === true);

  if (!allFilled) {
    return res.status(400).json({
      error: "Cannot submit step. All required requirements must be uploaded.",
    });
  }

  await stepStatusModel.findByIdAndUpdate(data.currentStepStatusDoc._id, {
    $set: { status: StepStatusEnum.SUBMITTED },
  });

  const updatedStepStatus = await stepStatusModel.findById(
    data.currentStepStatusDoc._id
  );

  if (data.currentStepDoc.emailTriggers) {
    await sendApplicationUpdateEmails({
      triggers: data.currentStepDoc.emailTriggers,
      stepStatus: StepStatusEnum.SUBMITTED,
      visaType: data.visaType.visaType,
      email: data.user.email,
      firstName: data.user.name,
    });
  }

  if (data.currentStepDoc.logTriggers){
    await createLogForVisaApplication({
      triggers : data.currentStepDoc.logTriggers,
      clientName : data.user.name,
      visaType : data.visaType.visaType,
      stepName : data.currentStepDoc.stepName,
      stepStatus : StepStatusEnum.SUBMITTED , 
      doneBy : req.admin?.userName || req.user?.userName , 
      visaApplicationId : new mongoose.Types.ObjectId(visaApplicationId),
    })
  }

  return res.status(200).json({
    message: "Step submitted successfully.",
    updatedStepStatus: updatedStepStatus,
  });
};

// continue (from user-side)
export const moveToNextStep = async (req: Request, res: Response) => {
  const { visaApplicationId } = req.params;

  if (!visaApplicationId) {
    return res.status(400).json({ error: "visaApplicationId is required." });
  }

  const visaApp = await visaApplicationModel.findById(visaApplicationId);
  if (!visaApp) {
    return res.status(404).json({ error: "Visa Application not found." });
  }

  visaApp.currentStep += 1;

  await visaApp.save();

  return res.status(200).json({
    message: "Moved to next step successfully.",
    updatedVisaApplication: visaApp,
  });
};
