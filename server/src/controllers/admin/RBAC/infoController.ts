import { NextFunction, Request, Response } from "express";
import mongoose, { Schema, Document } from "mongoose";
import AppError from "../../../utils/appError";
import { UserModel as userModel } from "../../../models/Users";
import { RoleModel as roleModel } from "../../../models/rbacModels/roleModel";
import { ActionModel as actionModel } from "../../../models/rbacModels/actionModel";
import { FeatureModel as featureModel } from "../../../models/rbacModels/featureModel";
import { PermissionModel as permissionModel } from "../../../models/rbacModels/permissionModel";
import bcrypt from "bcryptjs";
import {
  RoleEnum,
  AccountStatusEnum,
} from "../../../types/enums/enums";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../../utils/jwtUtils";
import { searchPaginatedQuery } from "../../../services/searchAndPagination/searchPaginatedQuery";


// fetchAllFeatures 
export const fetchAllFeatures = async (req: Request, res: Response) => {
    const featuresWithActions = await featureModel.aggregate([
      {
        $lookup: {
          from: "actions", 
          localField: "_id",
          foreignField: "featureId",
          as: "actions",
        },
      },
      {
        $sort: { name: 1 }, 
      },
      {
        $project: {
          _id: 1,
          name: 1,
          code: 1,
          actions: {
            _id: 1,
            action: 1,
            description: 1,
          },
        },
      },
    ]);
  
    res.status(200).json({
      success: true,
      count: featuresWithActions.length,
      features: featuresWithActions,
    });
  };

  

export const fetchAllRoles = async (req: Request, res: Response) => {
  const roles = await roleModel.find().sort({ roleName: 1 });

  res.status(200).json({
    success: true,
    count: roles.length,
    roles,
  });
};



export const fetchAllAdminUsers = async (req: Request, res: Response) => {
  const {
    search,
    page = "1",
    limit = "10",
    sortBy = "name",
    order = "asc",
  } = req.query;

  const sortFieldsMap: Record<string, string> = {
    name: "name",
    email: "email",
    phone: "phone",
    employeeId: "employeeId",
  };

  const sortField = sortFieldsMap[sortBy as string] || "name";
  const sortOrder = order === "desc" ? -1 : 1;

  // Additional filters
  const additionalFilters = {
    role: RoleEnum.ADMIN
  };

  // Post match stages for the aggregation pipeline
  const postMatchStages = [
    {
      $lookup: {
        from: "roles",
        localField: "roleId",
        foreignField: "_id",
        as: "roleInfo"
      }
    },
    {
      $unwind: "$roleInfo"
    },
    {
      $project: {
        name: 1,
        phone: 1,
        employeeId: 1,
        email: 1,
        roleInfo: 1,
      }
    }
  ];

  const customSort = {
    [sortField]: sortOrder,
  };

  const result = await searchPaginatedQuery({
    model: userModel,
    collectionName: "users", // or whatever your user collection is called
    search: search as string,
    page: Number(page),
    limit: Number(limit),
    additionalFilters,
    postMatchStages,
    customSort,
  });

  res.status(200).json({
    success: true,
    message: "Admin users fetched successfully",
    admins: result.data,
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



// Fetch RoleWise Permission
export const fetchRoleWisePermissions = async (req: Request, res: Response) => {
  const roles = await roleModel.find();

  const result = await Promise.all(
    roles.map(async (role) => {
      const permissions = await permissionModel.aggregate([
        {
          $match: { roleId: role._id }
        },
        {
          $lookup: {
            from: "actions",
            localField: "actionId",
            foreignField: "_id",
            as: "action"
          }
        },
        { $unwind: "$action" },
        {
          $lookup: {
            from: "features",
            localField: "action.featureId",
            foreignField: "_id",
            as: "feature"
          }
        },
        { $unwind: "$feature" },
        {
          $group: {
            _id: "$feature._id",
            name: { $first: "$feature.name" },
            code: { $first: "$feature.code" },
            actions: {
              $push: {
                actionId: "$action._id",
                action: "$action.action"
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            featureId: "$_id",
            name: 1,
            code: 1,
            actions: 1
          }
        }
      ]);

      return {
        roleId: role._id,
        roleName: role.roleName,
        isEditable: role.isEditable,
        features: permissions
      };
    })
  );

  res.status(200).json(result);
};


// Asssign Single Permission
export const assignPermission = async (req: Request, res: Response) => {
    const { roleId, actionId } = req.body;
  
    if (!roleId || !actionId) {
      res.status(400);
      throw new Error("Both roleId and actionId are required.");
    }
  
    // Parallel existence checks
    const [role, action] = await Promise.all([
      roleModel.findById(roleId),
      actionModel.findById(actionId),
    ]);
  
    if (!role) {
      res.status(404);
      throw new Error("Role not found.");
    }
  
    if (!action) {
      res.status(404);
      throw new Error("Action not found.");
    }
  
    // Check for duplicate permission
    const existingPermission = await permissionModel.findOne({ roleId, actionId });
    if (existingPermission) {
      res.status(400);
      throw new Error("Permission already assigned to this role.");
    }
  
    // Create new permission
    const newPermission = await permissionModel.create({ roleId, actionId });
  
    res.status(201).json({
      success: true,
      message: "Permission assigned successfully.",
      permission: newPermission,
    });
  };
  
// Ṛevoke Single Permission
  export const revokePermission = async (req: Request, res: Response) => {
    const { roleId, actionId } = req.body;
  
    // Input validation
    if (!roleId || !actionId) {
      res.status(400);
      throw new Error("Both roleId and actionId are required.");
    }
  
    // Parallel existence checks
    const [role, action] = await Promise.all([
      roleModel.findById(roleId),
      actionModel.findById(actionId),
    ]);
  
    if (!role) {
      res.status(404);
      throw new Error("Role not found.");
    }
  
    if (!action) {
      res.status(404);
      throw new Error("Action not found.");
    }
  
    // Check if permission exists
    const permission = await permissionModel.findOne({ roleId, actionId });
    if (!permission) {
      res.status(404);
      throw new Error("Permission not found for this role and action.");
    }
  
    // Delete the permission
    await permissionModel.deleteOne({ _id: permission._id });
  
    res.status(200).json({
      success: true,
      message: "Permission revoked successfully.",
    });
  };
  



