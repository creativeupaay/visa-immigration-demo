import { Request, Response, NextFunction } from "express";
import { AssignmentModel } from "../models/teamAndTaskModels/assignModel";
import { TaskModel } from "../models/teamAndTaskModels/taskModel";
import mongoose from "mongoose";

// Helper function to check if an ID is valid
const isValidObjectId = (id: any) => mongoose.Types.ObjectId.isValid(id);

export const isAssigned = ( ) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const memberId = req.admin?.id;
      if (!memberId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Allow bypass if role has full access
      if (
        req.readAllLeads === true ||
        req.readAllVisaApplications === true ||
        req.writeOnAllLeads === true ||
        req.writeOnAllVisaApplications === true
      ) {
        return next();
      }

      // Extract possible resource IDs
      const leadId = req.body.leadId || req.params.leadId;
      const visaApplicationId = req.body.visaApplicationId || req.params.visaApplicationId;

      // If no resource to check, block request
      if (!isValidObjectId(leadId) && !isValidObjectId(visaApplicationId)) {
        return res.status(400).json({ message: "No valid resource ID provided for assignment check." });
      }

      // Find all tasks this user is assigned to
      const assignedTasks = await AssignmentModel.find({ memberId }).select("taskId");

      const assignedTaskIds = assignedTasks.map(a => a.taskId);

      // Load those tasks and get all attached leads/visaApplications
      const tasks = await TaskModel.find({ _id: { $in: assignedTaskIds } })
        .select("attachedLead attachedVisaApplication")
        .lean();

      const attachedLeads = tasks.map(t => t.attachedLead).filter((id): id is mongoose.Types.ObjectId => !!id);
      const attachedVisaApps = tasks.map(t => t.attachedVisaApplication).filter((id): id is mongoose.Types.ObjectId => !!id);

      let isAllowed = false;

      if (isValidObjectId(leadId) && attachedLeads.some(id => id.equals(leadId))) {
        isAllowed = true;
      }

      if (isValidObjectId(visaApplicationId) && attachedVisaApps.some(id => id.equals(visaApplicationId))) {
        isAllowed = true;
      }

      if (!isAllowed) {
        return res.status(403).json({ message: "You are not assigned to this resource." });
      }

      next();
    }
    catch (error) {
      console.error("Error in isAssigned middleware:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
};



