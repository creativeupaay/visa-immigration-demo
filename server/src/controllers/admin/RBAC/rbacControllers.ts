import { NextFunction, Request, Response } from "express";
import mongoose, { Schema, Document } from "mongoose";
import AppError from "../../../utils/appError";
import  { Types } from "mongoose";
import { UserModel as userModel } from "../../../models/Users";
import { RoleModel as roleModel } from "../../../models/rbacModels/roleModel";
import { ActionModel as actionModel } from "../../../models/rbacModels/actionModel";
import { FeatureModel as featureModel } from "../../../models/rbacModels/featureModel";
import { AssignmentModel  } from "../../../models/teamAndTaskModels/assignModel";
import { PermissionModel as permissionModel } from "../../../models/rbacModels/permissionModel";
import { logNewEmployeeCreated } from "../../../services/logs/triggers/RBAC&TaskLogs/RBAC/New-employee-created";
import { logEmployeeEdited } from "../../../services/logs/triggers/RBAC&TaskLogs/RBAC/Employee-edited";
import { logEmployeeDeleted } from "../../../services/logs/triggers/RBAC&TaskLogs/RBAC/Employee-deleted";
import { logNewRoleCreated } from "../../../services/logs/triggers/RBAC&TaskLogs/RBAC/New-role-created";
import { logRolePermissionsUpdated } from "../../../services/logs/triggers/RBAC&TaskLogs/RBAC/Permissions-of-role-Updated";
import bcrypt from "bcryptjs";
import { employeeAccountCreatedEmail } from "../../../services/emails/triggers/admin/RBAC/new-employee-created";
import { employeeProfileUpdatedEmail } from "../../../services/emails/triggers/admin/RBAC/employee-details-edited";
import {
  RoleEnum,
  AccountStatusEnum,
} from "../../../types/enums/enums";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../../utils/jwtUtils";


// 1st
export const addNewRole = async (req: Request, res: Response) => {
  const { name, actionIds } = req.body;
  
  if (!name || typeof name !== 'string') {
    res.status(400);
    throw new Error('Role name is required and must be a string.');
  }

  if (!Array.isArray(actionIds) || actionIds.some(id => typeof id !== 'string')) {
    res.status(400);
    throw new Error('actionIds must be an array of strings.');
  }

  // Check for existing role
  const existingRole = await roleModel.findOne({ roleName:name });
  if (existingRole) {
    res.status(409);
    throw new Error('Role already exists.');
  }

  // Create new role
  const newRole = await roleModel.create({ roleName:name });

  // Create permission for each actionId
  const permissions = actionIds.map(actionId => ({
    roleId: newRole._id,
    actionId,
  }));

  await permissionModel.insertMany(permissions);

  // call log function

  await logNewRoleCreated({
    roleName : name,
    doneByName : req.admin?.userName,
    doneBy : req.admin?.userName
  })

  res.status(201).json({
    message: 'Role and permissions created successfully.',
    role: newRole,
    permissionsCreated: permissions.length,
  });
};



export const assignActionsToRole = async (req: Request, res: Response) => {
  
  const { roleId, addIds = [], deleteIds = [] } = req.body;

  if (!roleId || (!Array.isArray(addIds) && !Array.isArray(deleteIds))) {
    res.status(400);
    throw new Error("roleId, addIds and/or deleteIds array are required");
  }

  // Check if role exists
  const role = await roleModel.findById(roleId);
  if (!role) {
    res.status(404);
    throw new Error("Role not found");
  }

  const result: any = {
    added: 0,
    deleted: 0,
    skipped: 0,
  };

  // Handle addIds
  if (Array.isArray(addIds) && addIds.length > 0) {
    const validAddActions = await actionModel.find({ _id: { $in: addIds } });
    const validAddActionIds = validAddActions.map(action => String(action._id));

    if (validAddActionIds.length !== addIds.length) {
      res.status(400);
      throw new Error("One or more addIds are invalid");
    }

    const existingPermissions = await permissionModel.find({
      roleId,
      actionId: { $in: validAddActionIds },
    });

    const existingActionIds = new Set(existingPermissions.map(p => String(p.actionId)));

    const newPermissions = validAddActionIds
      .filter(id => !existingActionIds.has(id))
      .map(actionId => ({ roleId, actionId }));

    const inserted = await permissionModel.insertMany(newPermissions);
    result.added = inserted.length;
    result.skipped = validAddActionIds.length - inserted.length;
  }

  // Handle deleteIds
  if (Array.isArray(deleteIds) && deleteIds.length > 0) {
    const validDeleteActions = await actionModel.find({ _id: { $in: deleteIds } });
    const validDeleteActionIds = validDeleteActions.map(action => String(action._id));

    if (validDeleteActionIds.length !== deleteIds.length) {
      res.status(400);
      throw new Error("One or more deleteIds are invalid");
    }

    const deleteResult = await permissionModel.deleteMany({
      roleId,
      actionId: { $in: validDeleteActionIds },
    });

    result.deleted = deleteResult.deletedCount || 0;
  }

  
  // Log for permission change of a role 
  

  await logRolePermissionsUpdated({
    roleName: role.roleName,
    doneByName : req.admin?.userName ,
    doneBy : req.admin?.userName
  })

  res.status(200).json({
    success: true,
    message: "Permissions updated successfully",
    ...result,
  });
};
  



// 4th  -->> Edit Employee
// req type -->> patch 
// And send only those fields which are updated 
export const editAdminUser = async (req: Request, res: Response) => {
  const { employeeId } = req.params;
  const {
    name,
    phone,
    nationality,
    roleName,
    password, 
  } = req.body;

  if (!name && !phone && !nationality && !roleName && !password) {
    res.status(400);
    throw new Error("At least one field is required to update.");
  }
  // Prepare map for sending in email fun call
  const displayableFields: Record<string, string> = {};

  if (name) displayableFields["Name"] = name;
  if (phone) displayableFields["Phone"] = phone;
  if (nationality) displayableFields["Nationality"] = nationality;

  const user = await userModel.findById( employeeId );
  if (!user) {
    res.status(404);
    throw new Error("Admin user not found.");
  }

  const oldName = user.name;

  let updatedFields: any = {};

  if (name) updatedFields.name = name;
  if (phone) updatedFields.phone = phone;
  if (nationality) updatedFields.nationality = nationality;

  if (roleName) {
    const existingRole = await roleModel.findOne({ roleName });
    if (!existingRole) {
      res.status(400);
      throw new Error("Provided roleName does not exist.");
    }
    updatedFields.roleId = existingRole._id;
    displayableFields["Role"] = roleName
  }

  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    updatedFields.password = hashedPassword;
    displayableFields["Password"] = password;
  }

  const updatedUser = await userModel.findByIdAndUpdate(employeeId, {
    $set: updatedFields,
  }, { new: true });

  // log for edit details of an adminUser 
  await logEmployeeEdited({
    employeeName :  oldName,
    doneByName   :  req.admin?.userName,
    doneBy : req.admin?.userName,
  });

  // Email for credentails change
  await employeeProfileUpdatedEmail({
    to : user.email,
    employeeName : user.name,
    updatedBy : req.admin?.userName ,
    updatedFields : displayableFields
  });

  res.status(200).json({
    message: "Admin user updated successfully.",
    updatedUser,
  });
};



// Delete the ADMIN USER
export const deleteAdminUser = async (req: Request, res: Response): Promise<Response> => {

  // Get userId from request parameters
  const { userId } = req.params;
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError("Valid userId is required", 400);
  }

  // Prevent admin from deleting themselves
  if (userId === req.admin?.id) {
    throw new AppError("Cannot delete your own account", 403);
  }

  // Check if the user exists and has ADMIN role
  const user = await userModel.findOne({ _id: userId, role: "ADMIN" });
  if (!user) {
    throw new AppError("Admin user not found", 404);
  }


  await logEmployeeDeleted({
    employeeName: user.name ,
    doneByName : req.admin?.userName , 
    doneBy : req.admin?.userName
  });

  // Delete the user
  await userModel.findByIdAndDelete(userId);

  // Delete all assignments where the user is assignee (memberId) 
  await AssignmentModel.deleteMany({
    memberId: userId,
  });

  

  return res.status(200).json({
    success: true,
    message: "Admin user and associated assignments deleted successfully",
  });
};


// Delete Role
export const deleteRole = async (req: Request, res: Response) => {

  const { roleId } = req.params;

  // 1. Check if the role is assigned to any user
  const userExists = await userModel.findOne({ roleId });

  if (userExists) {
    return res.status(400).json({
      success: false,
      message: "Cannot delete this role. It is assigned to one or more users.",
    });
  }

  // 2. Proceed to delete the role
  const deleted = await roleModel.findByIdAndDelete(roleId);

  if (!deleted) {
    return res.status(404).json({
      success: false,
      message: "Role not found.",
    });
  }

  res.status(200).json({
    success: true,
    message: "Role deleted successfully.",
  });
};


//Edit RoleName
export const editRoleName = async (req: Request, res: Response) => {
  const { roleId } = req.params;
  const { roleName } = req.body;

  if (!roleName) {
    res.status(400);
    throw new Error("New role name is required.");
  }

  // Check if the role exists
  const existingRole = await roleModel.findById(roleId);
  if (!existingRole) {
    res.status(404);
    throw new Error("Role not found.");
  }

  // Check if the new roleName already exists in another role
  const duplicate = await roleModel.findOne({ roleName });
  
  if (duplicate && String(duplicate._id) !== roleId) {
    res.status(409);
    throw new Error("A role with this name already exists.");
  }

  // Update the role name
  existingRole.roleName = roleName;
  await existingRole.save();

  res.status(200).json({
    success: true,
    message: "Role name updated successfully.",
    role: existingRole,
  });
};










  //2nd 
  // export const addNewAdminUser = async (req: Request, res: Response) => {
  //   const {
  //     name,
  //     email,
  //     phone,
  //     nationality,
  //     password, //optional
  //   } = req.body;
  
  //   if (!name || !email || !phone ) {
  //     res.status(400);
  //     throw new Error("Missing required fields.");
  //   }
  
  //   const { roleId } = req.params;
  
  //   // Check if the user already exists
  //   const existingUser = await userModel.findOne({ email });
  //   if (existingUser) {
  //     res.status(409);
  //     throw new Error("User with this email already exists.");
  //   }
  
  //   // Use provided password or generate a 5-digit one
  //   const plainPassword = password || Math.floor(10000 + Math.random() * 90000).toString();
  //   const hashedPassword = await bcrypt.hash(plainPassword, 10);
    
  
  //   const roleDoc =  await roleModel.findById(roleId);
  
  //   if (!roleDoc) {
  //     res.status(400);
  //     throw new Error(`No role found with name: ${roleId}`);
  //   }
  
  //   // Create the new admin user
  //   const newUser = new userModel({
  //     name,
  //     email,
  //     phone,
  //     nationality,
  //     password: hashedPassword,
  //     UserStatus: AccountStatusEnum.ACTIVE,
  //     role: RoleEnum.ADMIN,
  //     roleId : roleDoc?._id || null,
  //     forgotPasswordToken: null,
  //     forgotPasswordExpires: null
  //   });
  
  //   await newUser.save();
  
  //   let refreshToken = generateRefreshToken({
  //     id: String(newUser._id),
  //     role: newUser.role,
  //     roleId: String(newUser.roleId),
  //     userName : newUser.name,
  //     email : newUser.email
  //   });
  
  //   await userModel.findByIdAndUpdate(newUser._id, { refreshToken });
  
  //   // call log function for employee create
  //   await logNewEmployeeCreated({
  //     employeeName: newUser.name,
  //     roleName : roleDoc?.roleName ,
  //     employeeEmail :newUser.email ,
  //     doneByName : req.admin?.userName,
  //     doneBy : req.admin?.userName
  //   })
  
  //   // Call Email trigger 
  //   await employeeAccountCreatedEmail({
  //     to : newUser.email,               
  //     employeeName : newUser.name,     
  //     email : newUser.email,            
  //     password : password ,         
  //     role : roleDoc.roleName,             
  //     loginUrl : `${process.env.FRONTEND_URL}/login`
  //   })
  
  //   res.status(201).json({
  //     message: "Admin user created successfully.",
  //     newUser ,
  //   });
  // };



  // 3rd
  // export const assignActionsToRole = async (req: Request, res: Response) => {
  //   const { roleId, actionIds } = req.body;

  //   if (!roleId || !Array.isArray(actionIds)) {
  //     res.status(400);
  //     throw new Error("roleId and actionIds array are required");
  //   }

  //   if (actionIds.length === 0) {
  //     res.status(400);
  //     throw new Error("actionIds array cannot be empty");
  //   }

  //   // Check if role exists
  //   const role = await roleModel.findById(roleId);
  //   if (!role) {
  //     res.status(404);
  //     throw new Error("Role not found");
  //   }

  //   // Validate all actionIds exist
  //   const validActions = await actionModel.find({ _id: { $in: actionIds } });
  //   const validActionIds = validActions.map(action => String(action._id));

  //   if (validActionIds.length !== actionIds.length) {
  //     res.status(400);
  //     throw new Error("One or more actionIds are invalid");
  //   }

  //   // Filter out already existing permissions
  //   const existingPermissions = await permissionModel.find({
  //     roleId,
  //     actionId: { $in: validActionIds },
  //   });

  //   // find existing Id's (so we can filter  filter kar lenge )
  //   const existingActionIds = new Set(existingPermissions.map(p => String(p.actionId)));

  //   const newPermissionsData = validActionIds
  //     .filter(id => !existingActionIds.has(id))
  //     .map(actionId => ({
  //       roleId,
  //       actionId,
  //     }));

  //   // Insert only the new (non-duplicate) permissions
  //   const insertedPermissions = await permissionModel.insertMany(newPermissionsData);

  //   res.status(201).json({
  //     success: true,
  //     message: `${insertedPermissions.length} permission(s) assigned to role.`,
  //     permissions: insertedPermissions,
  //     skipped: validActionIds.length - insertedPermissions.length,
  //   });
  // };