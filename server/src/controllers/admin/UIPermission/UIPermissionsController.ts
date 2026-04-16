import { NextFunction, Request, Response } from "express";
import AppError from "../../../utils/appError";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { PermissionModel } from "../../../models/rbacModels/permissionModel";
import { UIPermissionModel } from "../../../models/UIPermissions/uIPermissions";

export const FetchUIPermissions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) return next(new AppError("Access token missing", 401));

    const userData = jwt.decode(accessToken) as { id: string; roleId: string };
    if (
      !userData?.roleId ||
      !mongoose.Types.ObjectId.isValid(userData.roleId)
    ) {
      return next(new AppError("Invalid role ID in token", 403));
    }

    const roleId = new mongoose.Types.ObjectId(userData.roleId);

    // Step 1: Get all actionIds for this role
    const permissions = await PermissionModel.find({ roleId }).select("actionId");
    const userActionIds = permissions.map((perm) => perm.actionId.toString());

    // Step 2: Get all UI permissions
    const uiPermissions = await UIPermissionModel.find().select("code orActions andActions");

    // Step 3: Create result map
    const permissionMap: Record<string, boolean> = {};

    uiPermissions.forEach((uiPerm: any) => {
      const orActions = uiPerm.orActions || [];
      const andActions = uiPerm.andActions || [];

      const hasOrPermission =
        orActions.length === 0 ||
        orActions.some((actionId: any) => userActionIds.includes(actionId.toString()));

      const hasAndPermission =
        andActions.length === 0 ||
        andActions.every((actionId: any) => userActionIds.includes(actionId.toString()));

      // Final permission = OR condition passed AND AND condition passed
      permissionMap[uiPerm.code] = hasOrPermission && hasAndPermission;
    });

    return res.status(200).json({ success: true, permissions: permissionMap });
  } catch (error) {
    return next(new AppError("Failed to fetch UI permissions", 500));
  }
};
