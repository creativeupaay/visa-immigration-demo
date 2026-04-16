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
import {logTaskUpdated} from "../../../services/logs/triggers/RBAC&TaskLogs/Task-Management/Task-updated";
import {logTaskDeleted} from "../../../services/logs/triggers/RBAC&TaskLogs/Task-Management/Task-deleted";
import {logNewTaskCreated} from "../../../services/logs/triggers/RBAC&TaskLogs/Task-Management/New-task-created";

import { taskAssignedEmail }   from "../../../services/emails/triggers/admin/Task-Management/task-assigned";
import { assigneeAddedEmail }  from "../../../services/emails/triggers/admin/Task-Management/assignee-added";
import { taskCompletedEmail }  from "../../../services/emails/triggers/admin/Task-Management/task-completed";
import { taskDeletedEmail }    from "../../../services/emails/triggers/admin/Task-Management/task-deleted";
import { taskDueOverdueEmail } from "../../../services/emails/triggers/admin/Task-Management/task-due-overdue";
import { taskEditedEmail }     from "../../../services/emails/triggers/admin/Task-Management/task-edited";



export const addNewTask = async (req: Request, res: Response) => {
  const {
    taskName,
    description,
    priority,
    startDate,
    endDate,
    attachedLead,
    attachedVisaApplication,
  } = req.body;

  let { assignedTo } = req.body;

  console.log("Data received for new task:", req.body);

  // Validate required fields
  if (!taskName || !priority || !startDate || !endDate || !assignedTo) {
    res.status(400);
    throw new Error("Required fields are missing.");
  }

  if (typeof assignedTo === "string") {
    try {
      assignedTo = JSON.parse(assignedTo);
    } catch {
      assignedTo = [assignedTo]; // treat as single user ID
    }
  }
  // Ensure assignedTo is an array
  if (!Array.isArray(assignedTo)) {
    res.status(400);
    throw new Error("assignedTo must be an array of user IDs.");
  }

  // Handle file uploads (Multer + S3)
  const files =
    (req.files as Express.Multer.File[] | undefined)?.map(
      (file) => (file as any).location
    ) || [];

  let attchedClient = undefined;

  // Get client (userId) from visa application
  if (attachedVisaApplication) {
    const visaApp = await VisaApplicationModel.findById(
      attachedVisaApplication
    ).select("userId");
    if (!visaApp) {
      res.status(404);
      throw new Error("Visa Application not found.");
    }
    attchedClient = visaApp.userId;
  }

  let attchedConsultation = undefined;

  // Get consultation from lead if available
  if (attachedLead) {
    const consultation = await ConsultationModel.findOne({
      leadId: attachedLead,
    }).select("_id");
    if (consultation) {
      attchedConsultation = consultation._id;
    }
  }

  // Create the task
  const newTask = new TaskModel({
    taskName,
    description,
    priority,
    startDate,
    endDate,
    attachedLead,
    attachedVisaApplication,
    attchedClient,
    attchedConsultation,
    files,
    status: taskStatusEnum.DUE,
  });

  const savedTask = await newTask.save();

  // Create assignments
  const assignments = assignedTo.map((userId: string) => ({
    taskId: savedTask._id,
    memberId: userId,
    assignedBy: req.admin?.id, // assumes `req.admin.id` exists via auth middleware
  }));

  if (assignments.length > 0) {
    await AssignmentModel.insertMany(assignments);
  }

  // ✅ Fetch assignee names for logging
  const assignedUsers = await UserModel.find({ _id: { $in: assignedTo } });
  const assignedToNames = assignedUsers.map((user) => user.name || "Unknown");

  await logNewTaskCreated({
    taskTitle: savedTask.taskName,
    assignedTo : assignedToNames,
    adminName: req.admin?.userName,
    taskId: savedTask._id as mongoose.Types.ObjectId,
    doneBy : req.admin?.userName,
  });


  // send email to all assigneeS
  await Promise.all(
    assignedUsers.map(async (user) => {
      try {
        await taskAssignedEmail({
          to: user.email,
          assigneeName: user.name ,
          taskName: savedTask.taskName,
          priority : savedTask.priority,
          startDate: new Date(startDate).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }),
          endDate: new Date(endDate).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }),  
          assignedBy: req.admin?.userName,
        });
      } catch (err) {
        console.error(`Failed to send task email to ${user.email}`, err);
      }
    })
  );

 


  res.status(201).json({
    message: "Task created successfully",
    task: savedTask,
  });
};











// API for edit task
// REq type -->> only send required fields
// And send only thise fields from frontend (which are updated , not all )
export const editTask = async (req: Request, res: Response) => {
  const { taskId } = req.params;

  const {
    taskName,
    description,
    priority,
    startDate,
    endDate,
    attachedLead,
    attachedVisaApplication,
    assignedTo,
    status,
  } = req.body;

  // Array for sending in logFunction
  const updatedFields: string[] = [];

  // Validate assignedTo as an array
  if (assignedTo && !Array.isArray(assignedTo)) {
    res
      .status(400)
      .json({ message: "assignedTo must be an array of user IDs" });
    return;
  }

  const task = await TaskModel.findById(taskId);
  if (!task) {
    res.status(404).json({ message: "Task not found" });
    return;
  }

  const oldTaskName = task.taskName;

  // Convert uploaded files to S3 URLs (if any)
  const newFiles =
    (req.files as Express.Multer.File[] | undefined)?.map(
      (file) => (file as any).location
    ) || [];

  // Fetch updated client from visa application if provided
  let attachedClient = task.attachedClient;
  if (attachedVisaApplication) {
    const visaApp = await VisaApplicationModel.findById(
      attachedVisaApplication
    ).select("userId");
    if (!visaApp) {
      res
        .status(404)
        .json({
          message:
            "Visa application not found corresponding to attachedVisaApplication",
        });
      return;
    }
    attachedClient = visaApp.userId as unknown as mongoose.Types.ObjectId;
    task.attachedVisaApplication = attachedVisaApplication;
    task.attachedClient = attachedClient;
    updatedFields.push("attachedVisaApplication", "attachedClient");
  }

  // Fetch updated consultation from lead if provided
  let attachedConsultation = task.attachedConsultation;
  if (attachedLead) {
    const consultation = await ConsultationModel.findOne({
      leadId: attachedLead,
    }).select("_id");
    if (consultation) {
      attachedConsultation =   consultation._id as unknown as mongoose.Types.ObjectId;
      task.attachedLead = attachedLead;
      task.attachedConsultation = attachedConsultation;
      updatedFields.push("attachedLead", "attachedConsultation");
    }
  }

  // Update fields only if valid
  if (taskName !== undefined && task.taskName !== taskName) {
    task.taskName = taskName;
    updatedFields.push("taskName");
  }

  if (description !== undefined && task.description !== description) {
    task.description = description;
    updatedFields.push("description");
  }

  if (priority !== undefined && priority !== "" && task.priority !== priority) {
    task.priority = priority;
    updatedFields.push("priority");
  }

  if (startDate !== undefined && startDate !== "" && task.startDate?.toISOString() !== new Date(startDate).toISOString()) {
    task.startDate = startDate;
    updatedFields.push("startDate");
  }

  if (endDate !== undefined && endDate !== "" && task.endDate?.toISOString() !== new Date(endDate).toISOString()) {
    task.endDate = endDate;
    updatedFields.push("endDate");
  }

  if (status !== undefined && task.status !== status) {
    task.status = status;
    updatedFields.push("status");
  }

  // Merge & deduplicate files
  // task.files = Array.from(new Set([...task.files, ...newFiles]));
  if (newFiles.length > 0) {
    const merged = Array.from(new Set([...task.files, ...newFiles]));
    if (merged.length !== task.files.length) {
      task.files = merged;
      updatedFields.push("files");
    }
  }

  const updatedTask = await task.save();

  // --- STEP 1: Get Old Assignees ---
  const oldAssignments = await AssignmentModel.find({ taskId });
  const oldAssigneeIds = oldAssignments.map(a => a.memberId.toString());

  // --- STEP 2: Compare AssignedTo Lists ---
  if (assignedTo) {
      const newAssigneeIds = assignedTo.map((id: string) => id.toString());
      // newlyAdded -->> jo abhi hai , lekin pahle nahi the
      const newlyAdded = newAssigneeIds.filter((id:string) => !oldAssigneeIds.includes(id));
      // stillAssigned -->. jo pahle bhi the , aur abhi bhi hai 
      const stillAssigned = oldAssigneeIds.filter((id:string) => newAssigneeIds.includes(id));

      // Now call email function to send mail to stillAssigned employees...
      if (newlyAdded.length > 0 && stillAssigned.length > 0) {
        //  Fetch user details
        const stillUsers = await UserModel.find({ _id: { $in: stillAssigned } });
        const newUsers = await UserModel.find({ _id: { $in: newlyAdded } });
        const newAssigneeNames = newUsers.map(user => user.name);
    
        for (const user of stillUsers) {
          // Email for Assignees added
          await assigneeAddedEmail(
            user.email,
            user.name,
            task.taskName,
            newAssigneeNames,
            req.admin?.userName
          );
          // Email when task edited
          await taskEditedEmail({
            to : user.email ,                  
            assigneeName : user.name,        
            taskName : oldTaskName ,         
            updatedBy : req.admin?.userName,          
            updatedAt : new Date().toLocaleString("en-IN", {
              timeZone: "Asia/Kolkata",
            }),          
            updatedFields : updatedFields
          })
        }

        // email when task is completed
        if (status !== undefined   &&   status == taskStatusEnum.COMPLETED    &&     task.status == status){
          for (const user of stillUsers) {
            // Email for Assignees added
            await taskCompletedEmail({
              to : user.email,                 
              assigneeName : user.name ,    
              taskName :  task.taskName ,          
              completedBy : req.admin?.userName  ,       
              completedAt : new Date().toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
              })
            });
          }
        }


      }
      // Delete existing assignments
      await AssignmentModel.deleteMany({ taskId });

      const assignments = assignedTo.map((memberId: string) => ({
        taskId: task._id,
        memberId,
        assignedBy: req.admin?.id,
      }));

      if (assignments.length > 0) {
        await AssignmentModel.insertMany(assignments);
        updatedFields.push("assignedTo");
      }
  }


  // ✅ Call logging function & edit email function if fields were updated
  if (updatedFields.length > 0) {
    await logTaskUpdated({
      taskTitle: oldTaskName,
      updatedFields,
      updatedAt: new Date(),
      adminName: req.admin?.userName,
      taskId : task._id as mongoose.Types.ObjectId , 
      doneBy : req.admin?.userName,
    }); 
  }

  

  return res.status(200).json({
    message: "Task updated successfully",
    task: updatedTask,
  });
};







// Deleting a task
export const deleteTask = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const adminId = req.admin?.id;
  if (!adminId) {
    throw new AppError("Admin not authenticated", 401);
  }

  const { taskId } = req.params;
  if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
    throw new AppError("Valid taskId is required", 400);
  }

  const task = await TaskModel.findById(taskId);
  if (!task) {
    throw new AppError("Task not found", 404);
  }

  // ✅ Get assignees before deletion
  const assignments = await AssignmentModel.find({ taskId });
  const assigneeIds = assignments.map(a => a.memberId);

  const assignees = await UserModel.find({ _id: { $in: assigneeIds } });

  const deletedBy = req.admin?.userName || "Admin";
  const deletedAt = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  });

  await Promise.all(
    assignees.map(user =>
      taskDeletedEmail(
        user.email,
        user.name,
        task.taskName,
        deletedBy,
        deletedAt
      )
    )
  );

  // Delete the task
  await TaskModel.findByIdAndDelete(taskId);

  // Delete all assignments associated with the task
  await AssignmentModel.deleteMany({ taskId });

   // ✅ Log task deletion
   await logTaskDeleted({
    taskTitle: task.taskName,
    adminName :  req.admin?.userName,
    taskId: task._id as mongoose.Types.ObjectId,
    doneBy : req.admin?.userName,
  });

  return res.status(200).json({
    success: true,
    message: "Task and associated assignments deleted successfully",
  });
};
