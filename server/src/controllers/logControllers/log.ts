import { Request, Response } from "express";
import { LogModel } from "../../models/logsModels/logModel";
import mongoose, { Schema, Document, Types } from "mongoose";


export const fetchAllLogs = async (req: Request, res: Response) => {
  // const logs = await LogModel.aggregate([
  //   {
  //     $lookup: {
  //       from: "users",
  //       localField: "doneBy",
  //       foreignField: "_id",
  //       as: "doneBy"
  //     }
  //   },
  //   { $unwind: { path: "$doneBy", preserveNullAndEmptyArrays: true } },
  //   {
  //     $lookup: {
  //       from: "roles",
  //       localField: "doneBy.roleId",
  //       foreignField: "_id",
  //       as: "roleInfo"
  //     }
  //   },
  //   { $unwind: { path: "$roleInfo", preserveNullAndEmptyArrays: true } },
  //   {
  //     $project: {
  //       logMsg: 1,
  //       logType: 1,
  //       leadId: 1,
  //       visaApplicationId: 1,
  //       createdAt: 1,
  //       doneBy: {
  //         _id: "$doneBy._id",
  //         name: "$doneBy.name",
  //         email: "$doneBy.email",
  //         role: "$doneBy.role",
  //         employeeId: "$doneBy.employeeId",
  //         nanoUserId: "$doneBy.nanoUserId",
  //         roleName: "$roleInfo.roleName"
  //       }
  //     }
  //   },
  //   {
  //     $sort: { createdAt: -1 }
  //   }
  // ]);

  const logs = await LogModel.find().sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    message: "Logs fetched successfully",
    logs: logs
  });
};



  export const getParticularApplicationLogs = async (req: Request, res: Response) => {
    const { visaApplicationId } = req.params;
  
    if (!mongoose.Types.ObjectId.isValid(visaApplicationId)) {
      return res.status(400).json({ success: false, message: "Invalid visaApplicationId" });
    }

    // Check if assignedIds exist and leadId is not included
    if (Array.isArray(req.assignedIds) &&  !req.assignedIds.map((id) => id.toString()).includes(visaApplicationId)  ) {
      return res
        .status(403)
        .json({ message: "Your role does not have permission to do this action." });
    }
  
    // const logs = await LogModel.aggregate([
    //   {
    //     $match: { visaApplicationId: new mongoose.Types.ObjectId(visaApplicationId) }
    //   },
    //   {
    //     $lookup: {
    //       from: "users",
    //       localField: "doneBy",
    //       foreignField: "_id",
    //       as: "doneBy"
    //     }
    //   },
    //   { $unwind: { path: "$doneBy", preserveNullAndEmptyArrays: true } },
    //   {
    //     $lookup: {
    //       from: "roles",
    //       localField: "doneBy.roleId",
    //       foreignField: "_id",
    //       as: "roleInfo"
    //     }
    //   },
    //   { $unwind: { path: "$roleInfo", preserveNullAndEmptyArrays: true } },
    //   {
    //     $project: {
    //       logMsg: 1,
    //       logType: 1,
    //       createdAt: 1,
    //       doneBy: {
    //         _id: "$doneBy._id",
    //         name: "$doneBy.name",
    //         email: "$doneBy.email",
    //         role: "$doneBy.role",
    //         employeeId: "$doneBy.employeeId",
    //         nanoUserId: "$doneBy.nanoUserId",
    //         roleName: "$roleInfo.roleName"
    //       }
    //     }
    //   },
    //   {
    //     $sort: { createdAt: -1 }
    //   }
    // ]);


    const logs = await LogModel.find(
      { visaApplicationId: new mongoose.Types.ObjectId(visaApplicationId) },
      {
        logMsg: 1,
        logType: 1,
        createdAt: 1,
        doneBy: 1,
      }
    ).sort({ createdAt: -1 });
  
    return res.status(200).json({ success: true, logs });
  };
  


   export const getParticularLeadLogs = async (req: Request, res: Response) => {
    const { leadId } = req.params;
  
    if (!mongoose.Types.ObjectId.isValid(leadId)) {
      return res.status(400).json({ success: false, message: "Invalid leadId" });
    }

    // Check if assignedIds exist and leadId is not included
    if (Array.isArray(req.assignedIds) &&  !req.assignedIds.map((id) => id.toString()).includes(leadId)  ) {
      return res
        .status(403)
        .json({ message: "Your role does not have permission to do this action." });
    }
  
    // const logs = await LogModel.aggregate([
    //   {
    //     $match: { leadId: new mongoose.Types.ObjectId(leadId) }
    //   },
    //   {
    //     $lookup: {
    //       from: "users",
    //       localField: "doneBy",
    //       foreignField: "_id",
    //       as: "doneBy"
    //     }
    //   },
    //   { $unwind: { path: "$doneBy", preserveNullAndEmptyArrays: true } },
    //   {
    //     $lookup: {
    //       from: "roles",
    //       localField: "doneBy.roleId",
    //       foreignField: "_id",
    //       as: "roleInfo"
    //     }
    //   },
    //   { $unwind: { path: "$roleInfo", preserveNullAndEmptyArrays: true } },
    //   {
    //     $project: {
    //       logMsg: 1,
    //       logType: 1,
    //       createdAt: 1,
    //       doneBy: {
    //         _id: "$doneBy._id",
    //         name: "$doneBy.name",
    //         email: "$doneBy.email",
    //         role: "$doneBy.role",
    //         employeeId: "$doneBy.employeeId",
    //         nanoUserId: "$doneBy.nanoUserId",
    //         roleName: "$roleInfo.roleName"
    //       }
    //     }
    //   },
    //   {
    //     $sort: { createdAt: -1 }
    //   }
    // ]);

    const logs = await LogModel.find(
      { leadId: new mongoose.Types.ObjectId(leadId) },
      {
        logMsg: 1,
        logType: 1,
        createdAt: 1,
        doneBy: 1,
      }
    ).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, logs });
  };
  