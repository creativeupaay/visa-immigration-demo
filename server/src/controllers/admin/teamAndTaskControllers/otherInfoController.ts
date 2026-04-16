import { Request, Response } from "express";
import mongoose, { Schema, Document, Types } from "mongoose";
import AppError from "../../../utils/appError";
import { TaskModel } from "../../../models/teamAndTaskModels/taskModel";
import { AssignmentModel } from "../../../models/teamAndTaskModels/assignModel";
import { taskPriorityEnum, taskStatusEnum } from "../../../types/enums/enums";
import { LeadModel } from "../../../leadModels/leadModel";
import { VisaApplicationModel } from "../../../models/VisaApplication";
import { UserModel } from "../../../models/Users";
import { ConsultationModel } from "../../../leadModels/consultationModel";
import { remarkAddedEmail }    from "../../../services/emails/triggers/admin/Task-Management/remark-added";




export const getAllLeads = async (req: Request, res: Response) => {
  const matchStage: any = {};

  if (req.assignedIds && Array.isArray(req.assignedIds)) {
    matchStage._id = { $in: req.assignedIds };
  }

  const leads = await LeadModel.aggregate([
    // Match stage to filter leads if assignedIds exist
    { $match: matchStage },
    {
      $project: {
        name: { $ifNull: ["$fullName", "Unknown"] },
        leadType: "$__t",
        leadId: "$_id",
      },
    },
  ]);

  res.status(200).json({ leads });
};





// Name , visaType , visaApplicationId
export const getAllVisaApplications = async (req: Request, res: Response) => {
  const assignedIds = req.assignedIds;

  // Case 1: If assignedIds does not exist, fetch all visa applications
  if (!assignedIds) {
    const visaApplications = await VisaApplicationModel.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
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
          name: { $ifNull: ["$user.name", "Unknown"] }, // Fallback to "Unknown" if user.name is missing
          visaType: { $ifNull: ["$visaType.visaType", "Unknown"] }, // Fallback to "Unknown" if visaType.visaType is missing
          visaApplicationId: "$_id", // Fallback to "N/A" if nanoVisaApplicationId is missing
        },
      },
    ]);

    return res.status(200).json({ visaApplications });
  }

  // Case 2: If assignedIds exists but is empty, return an empty array
  if (Array.isArray(assignedIds) && assignedIds.length === 0) {
    return res.status(200).json({ visaApplications: [] });
  }

  // Case 3: If assignedIds exists and is non-empty, fetch matching visa applications
  const visaApplications = await VisaApplicationModel.aggregate([
    {
      $match: {
        _id: { $in: assignedIds.map((id) => new Types.ObjectId(id)) }, // Convert string IDs to ObjectId
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
      $unwind: {
        path: "$user",
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
        name: { $ifNull: ["$user.name", "Unknown"] },
        visaType: { $ifNull: ["$visaType.visaType", "Unknown"] },
        visaApplicationId: "$_id",
      },
    },
  ]);

  // Check if any visa applications were found
  if (!visaApplications || visaApplications.length === 0) {
    return res
      .status(404)
      .json({ message: "No visa applications found for the assigned IDs" });
  }

  // Return the filtered visa applications
  res.status(200).json({ visaApplications });
};





export const getAssigneeList = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const adminId = req.admin?.id;
  if (!adminId) {
    throw new AppError("Admin not authenticated", 401);
  }

  const assignees = await UserModel.aggregate([
    {
      $match: {
        role: "ADMIN",
      },
    },
    {
      $lookup: {
        from: "roles",
        localField: "roleId",
        foreignField: "_id",
        as: "roleDetails",
      },
    },
    {
      $unwind: {
        path: "$roleDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        email: 1,
        role: 1,
        employeeId: 1,
        roleName: "$roleDetails.roleName",
        isSelf: { $eq: ["$_id", new mongoose.Types.ObjectId(adminId)] },
      },
    },
  ]);

  return res.status(200).json({
    success: true,
    message: "Assignee list (including self) fetched successfully",
    data: assignees,
  });
};




export const addRemark = async (req: Request, res: Response) => {
  const { taskId } = req.params;

  const doneBy = req.admin?.id;

  const { remarkMsg } = req.body;

  if (!taskId || !remarkMsg || !doneBy) {
    return res
      .status(400)
      .json({ message: "taskId, remarkMsg, and doneBy are required" });
  }

  if (
    !mongoose.Types.ObjectId.isValid(taskId) ||
    !mongoose.Types.ObjectId.isValid(doneBy)
  ) {
    return res.status(400).json({ message: "Invalid taskId or doneBy format" });
  }

  const task = await TaskModel.findById(taskId);
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  task.remarks.push({
    remarkMsg,
    doneBy: new mongoose.Types.ObjectId(doneBy),
  });

  await task.save();

  // Members whom we need to send emails
  const members = await AssignmentModel.aggregate([
    { $match: { taskId: new Types.ObjectId(taskId) } },
    {
      $lookup: {
        from: "users",
        localField: "memberId",
        foreignField: "_id",
        as: "member"
      }
    },
    { $unwind: "$member" },
    {
      $replaceRoot: { newRoot: "$member" }
    }
  ]);

  await Promise.all(
    members.map(async (user) => {
      try {
        await remarkAddedEmail({
          to: user.email,
          assigneeName: user.name,
          taskName: task.taskName,
          remarkedBy: req.admin?.userName,
          remarkedAt: new Date().toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }),
          remark: remarkMsg
        })
      } catch (err) {
        console.error(`Failed to send task email to ${user.email}`, err);
      }
    })
  );

  // Return success response
  return res.status(200).json({
    message: "Remark added successfully",
    task,
  });
};






// API for editing a remark msg
export const editRemark = async (req: Request, res: Response) => {
  const { taskId, remarkId } = req.params;
  const { remarkMsg } = req.body;
  const doneBy = req.admin?.id;

  // Validate inputs
  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    throw new AppError("Invalid task ID", 400);
  }
  if (!mongoose.Types.ObjectId.isValid(remarkId)) {
    throw new AppError("Invalid remark ID", 400);
  }
  if (!doneBy || !mongoose.Types.ObjectId.isValid(doneBy)) {
    throw new AppError("Invalid or missing user ID", 400);
  }
  if (!remarkMsg || typeof remarkMsg !== "string" || remarkMsg === "") {
    throw new AppError(
      "Remark message is required and must be a non-empty string",
      400
    );
  }

  // Check if task and remark exist
  const task = await TaskModel.findOne({
    _id: new mongoose.Types.ObjectId(taskId),
    "remarks._id": new mongoose.Types.ObjectId(remarkId),
  });

  if (!task) {
    throw new AppError("Task or remark not found", 404);
  }

  // Check if the user is authorized to edit the remark
  const remark = task.remarks.find((r) => r._id?.toString() === remarkId);
  if (!remark || remark.doneBy.toString() !== doneBy) {
    throw new AppError("You cannot edit this remark", 403);
  }

  // Update the remark
  const updatedTask = await TaskModel.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(taskId),
      "remarks._id": new mongoose.Types.ObjectId(remarkId),
    },
    {
      $set: {
        "remarks.$.remarkMsg": remarkMsg,
      },
    },
    { new: true }
  );

  return res.status(200).json({
    success: true,
    message: "Remark updated successfully",
    data: updatedTask,
  });
};
