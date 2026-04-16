import { NextFunction, Request, Response } from "express";
import AppError from "../../utils/appError";
import {  aimaStatusEnum , StepStatusEnum ,VisaTypeEnum } from "../../types/enums/enums"
import { aimaModel} from "../../extraModels/aimaModel";
import { UserModel} from "../../models/Users";
import { Types } from "mongoose";  
import { createLogForVisaApplication } from "../../services/logs/triggers/visaApplications/createLogForVisaApplication"  


// export const updateStatus = async (req: Request, res: Response) => {
//     const { aimaId } = req.params;
//     const { aimaNumber } = req.body;
  
//     const updatePayload: any = {
//       isCompleted: true,
//       completedOn: Date.now(),
//     };
  
//     // Only set aimaNumber if it's a non-empty string
//     if (aimaNumber && aimaNumber.trim() !== "") {
//       updatePayload.aimaNumber = aimaNumber;
//     }
  
//     const updatedDoc = await aimaModel.findByIdAndUpdate(aimaId, updatePayload, {
//       new: true,
//     });
  
//     if (!updatedDoc) {
//       res.status(404);
//       throw new Error("AIMA document not found");
//     }

//     const id = req.admin?.id;

//     const userDoc = await UserModel
//         .findById(id)
//         .select("name")
//         .lean();

//     await createLogForVisaApplication({
//       triggers : data.currentStepDoc.logTriggers,
//       clientName : data.user.name,
//       visaType : VisaTypeEnum.PORTUGAL,
//       stepName : "Visa Submission & Processing",
//       stepStatus : StepStatusEnum.APPROVED , 
//       adminName : userDoc?.name,
//       doneBy : null
//     })
  
//     res.status(200).json({
//       message: "AIMA step marked as completed",
//       data: updatedDoc,
//     });
// };



export const updateStatus = async (req: Request, res: Response) => {
  const { aimaId }     = req.params;
  const { aimaNumber } = req.body;

  // 1. Update AIMA completion
  const updatePayload: any = {
    isCompleted: true,
    completedOn: Date.now(),
  };

  if (aimaNumber?.trim()) {
    updatePayload.aimaNumber = aimaNumber;
  }

  const updatedDoc = await aimaModel.findByIdAndUpdate(aimaId, updatePayload, {
    new: true,
  });

  if (!updatedDoc) {
    return res.status(404).json({ message: "AIMA document not found" });
  }

  // 2. Get admin name
  const adminId = req.admin?.id;
  const adminDoc = adminId
    ? await UserModel.findById(adminId).select("name").lean()
    : null;

  // 3. Aggregate to fetch clientName, stepName, and logTriggers
  const [aggregatedData] = await aimaModel.aggregate([

    { 
      $match: { _id: new Types.ObjectId(aimaId) }
    },

    {
      $lookup: {
        from: "visaapplicationstepstatuses",
        localField: "stepStatusId",
        foreignField: "_id",
        as: "stepStatus",
      },
    },
    { $unwind: "$stepStatus" },

    // Join with VisaApplication
    {
      $lookup: {
        from: "visaapplications",
        localField: "stepStatus.visaApplicationId",
        foreignField: "_id",
        as: "visaApp",
      },
    },
    { $unwind: "$visaApp" },

    // Join with User (Client)
    {
      $lookup: {
        from: "users",
        localField: "visaApp.userId",
        foreignField: "_id",
        as: "client",
      },
    },
    { $unwind: "$client" },

    // Join with VisaStep (to get stepName and logTriggers)
    {
      $lookup: {
        from: "visasteps",
        localField: "stepStatus.stepId",
        foreignField: "_id",
        as: "visaStep",
      },
    },
    { $unwind: "$visaStep" },

    {
      $project: {
        _id: 0,
        clientName: "$client.name",
        stepName: "$visaStep.stepName",
        logTriggers: "$visaStep.logTriggers",
        visaApplicationId: "$visaApp._id"
      },
    },
  ]);

  // Fallbacks in case aggregation fails
  const clientName   = aggregatedData?.clientName   ?? "Unknown";
  const stepName     = aggregatedData?.stepName     ?? "Unknown Step";
  const logTriggers  = aggregatedData?.logTriggers  ?? [];
  const visaApplicationId = aggregatedData?.visaApplicationId

  // 4. Create the log
  await createLogForVisaApplication({
    triggers: logTriggers,
    clientName,
    visaType: VisaTypeEnum.PORTUGAL, 
    stepName,
    stepStatus: StepStatusEnum.APPROVED,
    adminName: adminDoc?.name ,
    doneBy: req.admin?.userName || req.user?.userName ,
    visaApplicationId : visaApplicationId , 
  });

  // 5. Send Response
  return res.status(200).json({
    message: "AIMA step marked as completed",
    data: updatedDoc,
  });
};





  












  
  
  