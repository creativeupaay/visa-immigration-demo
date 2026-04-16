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
import { searchPaginatedQuery } from "../../../services/searchAndPagination/searchPaginatedQuery";

// Fetch All Tasks
export const fetchAllTasks = async (req: Request, res: Response) => {
  const {
    search,
    page = "1",
    limit = "10",
    sortBy = "dueDate",
    order = "asc",
  } = req.query;

  const sortFieldsMap: Record<string, string> = {
    priority: "priority",
    status: "status",
    dueDate: "endDate",
  };

  const sortField = sortFieldsMap[sortBy as string] || "endDate";
  const sortOrder = order === "desc" ? -1 : 1;

  const preMatchStages = [
    {
      $lookup: {
        from: "assignments",
        localField: "_id",
        foreignField: "taskId",
        as: "assignments",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "assignments.memberId",
        foreignField: "_id",
        as: "assignedToUsers",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "assignments.assignedBy",
        foreignField: "_id",
        as: "assignedByUsers",
      },
    },
  ];

  const customFields = [
    {
      name: "assignedCount",
      expression: { $size: "$assignedToUsers" },
    },
    {
      name: "assignedTo",
      expression: {
        $map: {
          input: "$assignedToUsers",
          as: "user",
          in: {
            _id: "$$user._id",
            name: "$$user.name",
            email: "$$user.email",
          },
        },
      },
    },
    {
      name: "assignedBy",
      expression: {
        $cond: {
          if: { $gt: [{ $size: "$assignedByUsers" }, 0] },
          then: {
            _id: { $arrayElemAt: ["$assignedByUsers._id", 0] },
            name: { $arrayElemAt: ["$assignedByUsers.name", 0] },
            email: { $arrayElemAt: ["$assignedByUsers.email", 0] },
          },
          else: null,
        },
      },
    },
  ];

  const customSort = {
    [sortField]: sortOrder,
  };

  // Include the custom fields in the select parameter
  const result = await searchPaginatedQuery({
    model: TaskModel,
    collectionName: "tasks",
    search: search as string,
    page: Number(page),
    limit: Number(limit),
    preMatchStages,
    customFields,
    customSort,
    // Fixed: Include custom fields in selection
    select:
      "taskName status priority endDate assignedTo assignedBy assignedCount",
  });

  const tasks = result.data.map((task: any) => ({
    ...task,
    status:
      task.status === taskStatusEnum.DUE && task.endDate < new Date()
        ? taskStatusEnum.OVERDUE
        : task.status,
  }));

  res.status(200).json({
    success: true,
    tasks: tasks,
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    },
  });
};

//   Fetch My tasks

export const fetchMyTasks = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const adminId = req.admin?.id;
  if (!adminId) {
    throw new AppError("Admin not authenticated", 401);
  }

  const {
    search = "",
    page = 1,
    limit = 10,
    sort = "-dueDate",
    status,
    priority,
    assignedBy: assignedByFilter,
  } = req.query;

  const additionalFilters: any = {};
  if (status) {
    additionalFilters["taskDetails.status"] = status;
  }
  if (priority) {
    additionalFilters["taskDetails.priority"] = priority;
  }
  if (assignedByFilter) {
    additionalFilters["assignedByDetails._id"] = new mongoose.Types.ObjectId(
      assignedByFilter as string
    );
  }

  additionalFilters.memberId = new mongoose.Types.ObjectId(adminId);

  const postMatchStages = [
    // Lookup task details
    {
      $lookup: {
        from: "tasks",
        localField: "taskId",
        foreignField: "_id",
        as: "taskDetails",
      },
    },
    { $unwind: "$taskDetails" },

    // Lookup assigned users
    {
      $lookup: {
        from: "assignments",
        let: { currentTaskId: "$taskId" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$taskId", "$$currentTaskId"] },
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "memberId",
              foreignField: "_id",
              as: "memberDetails",
            },
          },
          { $unwind: "$memberDetails" },
          {
            $project: {
              userId: "$memberDetails._id",
              email: "$memberDetails.email",
              name: "$memberDetails.name",
            },
          },
        ],
        as: "assignedToUsers",
      },
    },

    // Lookup assigned by user
    {
      $lookup: {
        from: "users",
        localField: "assignedBy",
        foreignField: "_id",
        as: "assignedByDetails",
      },
    },
    {
      $unwind: {
        path: "$assignedByDetails",
        preserveNullAndEmptyArrays: true,
      },
    },

    // Final projection
    {
      $project: {
        _id: "$taskDetails._id",
        taskName: "$taskDetails.taskName",
        assignedBy: {
          userId: "$assignedByDetails._id",
          email: "$assignedByDetails.email",
          name: "$assignedByDetails.name",
        },
        assignedTo: "$assignedToUsers",
        status: "$taskDetails.status",
        priority: "$taskDetails.priority",
        endDate: "$taskDetails.endDate",
        // Keep these fields for search functionality
        taskDetails: "$taskDetails",
        assignedByDetails: "$assignedByDetails",
      },
    },
  ];

  const result = await searchPaginatedQuery({
    model: AssignmentModel,
    collectionName: "assignments",
    search: search as string,
    page: Number(page),
    limit: Number(limit),
    sort: sort as string,
    additionalFilters,
    postMatchStages,
  });

  const tasks = result.data.map((task: any) => ({
    ...task,
    status:
      task.status === taskStatusEnum.DUE && task.endDate < new Date()
        ? taskStatusEnum.OVERDUE
        : task.status,
  }));

  return res.status(200).json({
    success: true,
    message: "Tasks fetched successfully",
    tasks: tasks,
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
    },
  });
};

// Fetch Upcoming Taks -->> start date will start after now
export const fetchUpcomingTasks = async (
  req: Request,
  res: Response
): Promise<Response> => {
  console.log(`these are assignedIds for Upcoming tasks :`, req.assignedIds);

  const now = new Date();
  const {
    search = "",
    page = 1,
    limit = 10,
    sortBy = "startDate",
    order = "asc",
  } = req.query;

  const sortFieldsMap: Record<string, string> = {
    priority: "priority",
    status: "status",
    startDate: "startDate",
    dueDate: "endDate",
  };

  const sortField = sortFieldsMap[sortBy as string] || "startDate";
  const sortOrder = order === "desc" ? "-" : "";
  const sort = `${sortOrder}${sortField}`;

  const additionalFilters: any = {
    startDate: { $gt: now },
  };

  if (Array.isArray(req.assignedIds) && req.assignedIds.length > 0) {
    additionalFilters._id = { $in: req.assignedIds };
  }

  const postMatchStages = [
    // Lookup assignments
    {
      $lookup: {
        from: "assignments",
        localField: "_id",
        foreignField: "taskId",
        as: "assignments",
      },
    },
    // Lookup assigned to users
    {
      $lookup: {
        from: "users",
        localField: "assignments.memberId",
        foreignField: "_id",
        as: "assignedToUsers",
      },
    },
    // Lookup assigned by users
    {
      $lookup: {
        from: "users",
        localField: "assignments.assignedBy",
        foreignField: "_id",
        as: "assignedByUsers",
      },
    },
    // Final projection
    {
      $project: {
        taskName: 1,
        status: 1,
        priority: 1,
        endDate: 1,
        dueDate: "$endDate",
        assignedCount: { $size: "$assignedToUsers" },
        assignedTo: {
          $map: {
            input: "$assignedToUsers",
            as: "user",
            in: {
              _id: "$$user._id",
              name: "$$user.name",
              email: "$$user.email",
            },
          },
        },
        assignedBy: {
          $cond: {
            if: { $gt: [{ $size: "$assignedByUsers" }, 0] },
            then: {
              _id: { $arrayElemAt: ["$assignedByUsers._id", 0] },
              name: { $arrayElemAt: ["$assignedByUsers.name", 0] },
              email: { $arrayElemAt: ["$assignedByUsers.email", 0] },
            },
            else: null,
          },
        },
      },
    },
  ];

  const result = await searchPaginatedQuery({
    model: TaskModel,
    collectionName: "tasks",
    search: search as string,
    page: Number(page),
    limit: Number(limit),
    sort: sort as string,
    additionalFilters,
    postMatchStages,
  });

  return res.status(200).json({
    success: true,
    message: "Upcoming tasks fetched successfully",
    tasks: result.data,
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
    },
  });
};

// Fetch Due Tasks  -->> Now is in b/w start and end
export const fetchDueTasks = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const now = new Date();
  const {
    search = "",
    page = 1,
    limit = 10,
    sortBy = "startDate",
    order = "asc",
  } = req.query;

  const sortFieldsMap: Record<string, string> = {
    priority: "priority",
    status: "status",
    startDate: "startDate",
    dueDate: "endDate",
  };

  const sortField = sortFieldsMap[sortBy as string] || "startDate";
  const sortOrder = order === "desc" ? "-" : "";
  const sort = `${sortOrder}${sortField}`;

  const additionalFilters: any = {
    startDate: { $lte: now },
    endDate: { $gte: now },
  };

  if (Array.isArray(req.assignedIds) && req.assignedIds.length > 0) {
    additionalFilters._id = { $in: req.assignedIds };
  }

  const postMatchStages = [
    // Lookup assignments
    {
      $lookup: {
        from: "assignments",
        localField: "_id",
        foreignField: "taskId",
        as: "assignments",
      },
    },
    // Lookup assigned to users
    {
      $lookup: {
        from: "users",
        localField: "assignments.memberId",
        foreignField: "_id",
        as: "assignedToUsers",
      },
    },
    // Lookup assigned by users
    {
      $lookup: {
        from: "users",
        localField: "assignments.assignedBy",
        foreignField: "_id",
        as: "assignedByUsers",
      },
    },
    // Final projection
    {
      $project: {
        taskName: 1,
        status: 1,
        priority: 1,
        startDate: 1,
        endDate: "$endDate",
        assignedCount: { $size: "$assignedToUsers" },
        assignedTo: {
          $map: {
            input: "$assignedToUsers",
            as: "user",
            in: {
              _id: "$$user._id",
              name: "$$user.name",
              email: "$$user.email",
            },
          },
        },
        assignedBy: {
          $cond: {
            if: { $gt: [{ $size: "$assignedByUsers" }, 0] },
            then: {
              _id: { $arrayElemAt: ["$assignedByUsers._id", 0] },
              name: { $arrayElemAt: ["$assignedByUsers.name", 0] },
              email: { $arrayElemAt: ["$assignedByUsers.email", 0] },
            },
            else: null,
          },
        },
      },
    },
  ];

  const result = await searchPaginatedQuery({
    model: TaskModel,
    collectionName: "tasks",
    search: search as string,
    page: Number(page),
    limit: Number(limit),
    sort: sort as string,
    additionalFilters,
    postMatchStages,
  });

  return res.status(200).json({
    success: true,
    message: "Due tasks fetched successfully",
    tasks: result.data,
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
    },
  });
};

// Fetch OverDue TaskS -->> Jinki EndDate bhi nikal chuki hai
export const fetchOverdueTasks = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const now = new Date();
  const {
    search = "",
    page = 1,
    limit = 10,
    sortBy = "endDate",
    order = "asc",
  } = req.query;

  const sortFieldsMap: Record<string, string> = {
    priority: "priority",
    status: "status",
    startDate: "startDate",
    dueDate: "endDate",
  };

  const sortField = sortFieldsMap[sortBy as string] || "endDate";
  const sortOrder = order === "desc" ? "-" : "";
  const sort = `${sortOrder}${sortField}`;

  const additionalFilters: any = {
    status: taskStatusEnum.DUE,
    endDate: { $lt: now },
  };

  if (Array.isArray(req.assignedIds) && req.assignedIds.length > 0) {
    additionalFilters._id = { $in: req.assignedIds };
  }

  const postMatchStages = [
    // Lookup assignments
    {
      $lookup: {
        from: "assignments",
        localField: "_id",
        foreignField: "taskId",
        as: "assignments",
      },
    },
    // Lookup assigned to users
    {
      $lookup: {
        from: "users",
        localField: "assignments.memberId",
        foreignField: "_id",
        as: "assignedToUsers",
      },
    },
    // Lookup assigned by users
    {
      $lookup: {
        from: "users",
        localField: "assignments.assignedBy",
        foreignField: "_id",
        as: "assignedByUsers",
      },
    },
    // Final projection
    {
      $project: {
        taskName: 1,
        status: 1,
        priority: 1,
        endDate: 1,
        dueDate: "$endDate",
        assignedCount: { $size: "$assignedToUsers" },
        assignedTo: {
          $map: {
            input: "$assignedToUsers",
            as: "user",
            in: {
              _id: "$$user._id",
              name: "$$user.name",
              email: "$$user.email",
            },
          },
        },
        assignedBy: {
          $cond: {
            if: { $gt: [{ $size: "$assignedByUsers" }, 0] },
            then: {
              _id: { $arrayElemAt: ["$assignedByUsers._id", 0] },
              name: { $arrayElemAt: ["$assignedByUsers.name", 0] },
              email: { $arrayElemAt: ["$assignedByUsers.email", 0] },
            },
            else: null,
          },
        },
      },
    },
  ];

  const result = await searchPaginatedQuery({
    model: TaskModel,
    collectionName: "tasks",
    search: search as string,
    page: Number(page),
    limit: Number(limit),
    sort: sort as string,
    additionalFilters,
    postMatchStages,
  });

  const tasks = result.data.map((task: any) => ({
    ...task,
    status: taskStatusEnum.OVERDUE,
  }));

  return res.status(200).json({
    success: true,
    message: "Overdue tasks fetched successfully",
    tasks: tasks,
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
    },
  });
};
// Fetch Particular Task
// isme vo bhi handle karna hai , jab ye taskId , incoming array me se hi ek ho ....
export const fetchParticularTask = async (req: Request, res: Response) => {
  const { taskId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    throw new AppError("Invalid task ID", 400);
  }

  // Check if assignedIds exist and leadId is not included
  if (
    Array.isArray(req.assignedIds) &&
    !req.assignedIds.map((id) => id.toString()).includes(taskId)
  ) {
    return res.status(403).json({
      message: "Your role does not have permission to do this action.",
    });
  }

  const tasks = await TaskModel.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(taskId),
      },
    },
    {
      $lookup: {
        from: "leads",
        localField: "attachedLead",
        foreignField: "_id",
        as: "attachedLead",
      },
    },
    {
      $unwind: {
        path: "$attachedLead",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "visaapplications",
        localField: "attachedVisaApplication",
        foreignField: "_id",
        as: "attachedVisaApplication",
      },
    },
    {
      $unwind: {
        path: "$attachedVisaApplication",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "visatypes",
        localField: "attachedVisaApplication.visaTypeId",
        foreignField: "_id",
        as: "visaTypeData",
      },
    },
    {
      $unwind: {
        path: "$visaTypeData",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "assignments",
        localField: "_id",
        foreignField: "taskId",
        as: "assignments",
      },
    },
    {
      $unwind: {
        path: "$assignments",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "assignments.memberId",
        foreignField: "_id",
        as: "assignedUser",
      },
    },
    {
      $unwind: {
        path: "$assignedUser",
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $lookup: {
        from: "users",
        let: { remarkUserIds: "$remarks.doneBy" },
        pipeline: [
          {
            $match: {
              $expr: {
                $in: ["$_id", "$$remarkUserIds"],
              },
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
              email: 1,
            },
          },
        ],
        as: "remarkUsers",
      },
    },
    {
      $addFields: {
        remarks: {
          $map: {
            input: "$remarks",
            as: "remark",
            in: {
              _id: "$$remark._id",
              message: "$$remark.remarkMsg",
              doneBy: {
                $let: {
                  vars: {
                    matchedUser: {
                      $arrayElemAt: [
                        "$remarkUsers",
                        {
                          $indexOfArray: [
                            "$remarkUsers._id",
                            "$$remark.doneBy",
                          ],
                        },
                      ],
                    },
                  },
                  in: {
                    userId: "$$remark.doneBy",
                    name: { $ifNull: ["$$matchedUser.name", "Unknown"] },
                    email: { $ifNull: ["$$matchedUser.email", "Unknown"] },
                  },
                },
              },
            },
          },
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "assignments.assignedBy", // Use assignments.assignedBy
        foreignField: "_id",
        as: "assigner",
      },
    },
    {
      $unwind: {
        path: "$assigner",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: "$_id",
        taskName: { $first: "$taskName" },
        description: { $first: "$description" },
        status: { $first: "$status" },
        priority: { $first: "$priority" },
        startDate: { $first: "$startDate" },
        endDate: { $first: "$endDate" },
        assignedBy: { $first: "$assignedBy" },
        // attachedLead: { $first: "$attachedLead" },
        attachedLead: {
          $first: {
            leadId: "$attachedLead._id",
            name: "$attachedLead.fullName",
            leadType: "$attachedLead.__t",
          },
        },
        attachedClient: { $first: "$attachedClient" },
        // attachedVisaApplication: { $first: "$attachedVisaApplication" },
        attachedVisaApplication: {
          $first: {
            visaId: "$attachedVisaApplication._id",
            visaType: "$visaTypeData.visaType",
          },
        },
        attachedConsultation: { $first: "$attachedConsultation" },
        files: { $first: "$files" },
        remarks: { $first: "$remarks" }, // remarks
        assignedTo: {
          $push: {
            userId: "$assignedUser._id",
            email: "$assignedUser.email",
            name: "$assignedUser.name",
          },
        },
        assigner: { $first: "$assigner" }, // Keep the assigner lookup result
      },
    },
    {
      $project: {
        taskId: "$_id",
        taskName: 1,
        description: 1,
        status: 1,
        priority: 1,
        startDate: 1,
        endDate: 1,
        attachedLead: 1,
        attachedClient: 1,
        attachedVisaApplication: 1,
        attachedConsultation: 1,
        files: 1,
        remarks: 1, //remarks
        assignedTo: 1,
        assignedBy: {
          $cond: {
            if: { $eq: ["$assigner", null] },
            then: null,
            else: {
              userId: "$assigner._id",
              email: { $ifNull: ["$assigner.email", "Unknown"] },
              name: { $ifNull: ["$assigner.name", "Unknown"] },
            },
          },
        },
      },
    },
  ]);

  if (!tasks.length) {
    throw new AppError("Task not found", 404);
  }

  const task = tasks[0];

  // Post-process files to add name
  task.files = (task.files || []).map((url: string) => {
    // Extract the encoded file name from URL
    const encodedFileName = url.split("/").pop() || "unknown";

    // Decode to convert %5B → [, %5D → ], etc.
    const decodedFileName = decodeURIComponent(encodedFileName);

    // Remove the prefix timestamp (e.g., "1749641879307-")
    const parts = decodedFileName.split("-");
    const hasTimestamp = parts.length > 1 && /^\d+$/.test(parts[0]);
    const originalName = hasTimestamp
      ? parts.slice(1).join("-")
      : decodedFileName;

    return {
      url,
      name: originalName,
    };
  });

  return res.status(200).json({
    success: true,
    message: "Task fetched successfully",
    data: tasks[0],
  });
};
