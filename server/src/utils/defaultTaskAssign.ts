import mongoose from "mongoose";
import { TaskModel } from "../models/teamAndTaskModels/taskModel";
import { RoleModel } from "../models/rbacModels/roleModel";
import { PermissionModel } from "../models/rbacModels/permissionModel";
import { UserModel } from "../models/Users";
import { AssignmentModel } from "../models/teamAndTaskModels/assignModel";
import { ActionModel } from "../models/rbacModels/actionModel";
import { LeadModel } from "../leadModels/leadModel";
import { taskPriorityEnum } from "../types/enums/enums";

import { VisaApplicationModel } from "../models/VisaApplication";
import { VisaTypeModel } from "../models/VisaType";

export const assignDefaultLead = async (leadId: mongoose.Types.ObjectId) => {
  try {
    // Step 1: Fetch lead
    const lead = await LeadModel.findById(leadId).select("fullName");
    if (!lead) throw new Error("Lead not found");

    // Step 1.2: Generate task name using lead's full name
    const taskName = `Lead_${lead.fullName}`;

    // Step 1.3: Set dates
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7); // 1 week later

    // Step 1.4: Create task
    const task = await TaskModel.create({
      taskName,
      description: "",
      priority: taskPriorityEnum.MEDIUM,
      startDate,
      endDate,
      attachedLead: leadId,
    });

    // Step 2: Find action ID for "Get_Default(Lead_Tasks)"
    const action = await ActionModel.findOne({
      action: "Get_Default(Lead_Tasks)",
    });
    if (!action) throw new Error("Action 'Get_Default(Lead_Tasks)' not found");

    // Step 3: Get roleIds with permission for that action
    const permissions = await PermissionModel.find({ actionId: action._id });
    const roleIds = permissions.map((p) => p.roleId);

    // Step 4: Get users with those roles
    const users = await UserModel.find({ roleId: { $in: roleIds } }).select(
      "_id"
    );
    const userIds = users.map((u) => u._id);

    // Step 5: Create assignments
    const assignments = userIds.map((memberId) => ({
      taskId: task._id,
      memberId,
    }));

    await AssignmentModel.insertMany(assignments);

    console.log(`Default task assigned to ${userIds.length} users`);

    console.log("Default lead task created:", task.taskName);
  } catch (error) {
    console.error("Error in assignDefaultLead:", error);
    throw error;
  }
};

export const assignDefaultVisaApplication = async (
  visaApplicationId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId
) => {
  try {
    // Step A: Get user name
    const user = await UserModel.findById(userId).select("name");
    if (!user) throw new Error("User not found");

    // Step B: Get visaTypeId from visaApplication
    const visaApplication =
      await VisaApplicationModel.findById(visaApplicationId).select(
        "visaTypeId"
      );
    if (!visaApplication) throw new Error("Visa application not found");

    // Step C: Get visaType from visaTypeId
    const visaTypeDoc = await VisaTypeModel.findById(
      visaApplication.visaTypeId
    ).select("visaType");
    if (!visaTypeDoc) throw new Error("Visa type not found");

    // Step D: Generate dynamic taskName
    const taskName = `Application_${user.name}_${visaTypeDoc.visaType}`;

    // Step E: Set endDate 1 month later
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 3);

    // Step F: Create the default task
    const task = await TaskModel.create({
      taskName,
      description: "",
      priority: taskPriorityEnum.MEDIUM,
      startDate: new Date(),
      endDate,
      attachedVisaApplication: visaApplicationId,
      attachedClient: userId,
    });

    // Step 2: Find action ID for "Get_Default(Visapplication_Tasks)"
    const action = await ActionModel.findOne({
      action: "Get_Default(Visapplication_Tasks)",
    });
    if (!action) throw new Error("Action 'Get_Default(Visapplication_Tasks)' not found");

    // Step 3: Get roleIds with permission for that action
    const permissions = await PermissionModel.find({ actionId: action._id });
    const roleIds = permissions.map((p) => p.roleId);
      
    // Step 4: Get users with those roles
    const users = await UserModel.find({ roleId: { $in: roleIds } }).select(
      "_id"
    );
    const userIds = users.map((u) => u._id);

    // Step 5: Create assignments
    const assignments = userIds.map((memberId) => ({
      taskId: task._id,
      memberId,
    }));

    await AssignmentModel.insertMany(assignments);

    console.log(`Default task assigned to ${userIds.length} users`);
  } catch (error) {
    console.error("Error assigning default task:", error);
    throw error;
  }
};
