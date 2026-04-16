import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { AssignmentModel } from "../models/teamAndTaskModels/assignModel";
import { RoleModel } from "../models/rbacModels/roleModel";
import { TaskModel } from "../models/teamAndTaskModels/taskModel";
import AppError from "../utils/appError";

// Abhi toh fetch Upcoming taks fetch karna baaki hai (Special case se handle karna padega )
export const addArrayForStaff = (modelName: string) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (
        req.isViewAllLeads === true ||
        req.isViewAllConsultations === true ||
        req.isViewAllClients === true ||
        req.isViewAllVisaApplications === true || req.readAllLeads === true || 
        req.readAllVisaApplications === true ||
        req.writeOnAllLeads === true ||
        req.writeOnAllVisaApplications === true
      ) {
        return next();
      }

      const memberId = req.admin?.id;

      if (!memberId || !mongoose.Types.ObjectId.isValid(memberId)) {
        return next(new AppError("Invalid or missing memberId", 400));
      }

      const assignedTaskIds = await AssignmentModel.find({ memberId })
        .select("taskId")
        .then((docs) => docs.map((doc) => doc.taskId));

      const tasks = await TaskModel.find({ _id: { $in: assignedTaskIds } });

      let assignedIds: mongoose.Types.ObjectId[] = [];

      switch (modelName) {
        case "Leads":
          assignedIds = tasks
            .map((task) => task.attachedLead)
            .filter((id): id is mongoose.Types.ObjectId => !!id);
          break;

        case "VisaApplications":
          assignedIds = tasks
            .map((task) => task.attachedVisaApplication)
            .filter((id): id is mongoose.Types.ObjectId => !!id);
          console.log("Tasks: ",tasks)
          
          break;

        case "Clients":
          assignedIds = tasks
            .map((task) => task.attachedClient)
            .filter((id): id is mongoose.Types.ObjectId => !!id);
          break;

        case "Consultations":
          assignedIds = tasks
            .map((task) => task.attachedConsultation)
            .filter((id): id is mongoose.Types.ObjectId => !!id);
          break;

        case "Tasks":
          assignedIds = assignedTaskIds.filter(
            (id): id is mongoose.Types.ObjectId => !!id
          );
          console.log(`Assigned taskIds in addArray middleware`, assignedIds);
          break;

        default:
          return next(new AppError(`Invalid model name: ${modelName}`, 400));
      }

      req.assignedIds = assignedIds;
      return next();
    } catch (error) {
      console.error(
        `Error in addArrayForStaff middleware for ${modelName}:`,
        error
      );
      return next(
        new AppError("Server error while fetching assigned IDs", 500)
      );
    }
  };
};
