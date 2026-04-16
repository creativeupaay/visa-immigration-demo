import { NextFunction, Request, Response } from "express";
import AppError from "../../../utils/appError";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { UserModel } from "../../../models/Users";
import { RoleModel } from "../../../models/rbacModels/roleModel";

export const fetchAdminProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) return next(new AppError("Access token missing", 401));

    const userData = jwt.decode(accessToken) as { id: string; roleId: string };
    if (!userData?.id || !mongoose.Types.ObjectId.isValid(userData.id)) {
      return next(new AppError("Invalid user or role ID in token", 403));
    }

    const user = await UserModel.findById(userData.id).select(
      "-password -refreshToken -forgotPasswordToken -forgotPasswordExpires -__v"
    );
    if (!user) return next(new AppError("User not found", 404));

    const role = await RoleModel.findById(userData.roleId).select("-__v");

    const data = {
      ...user.toObject(),
      role: role ? role.roleName : "No Role Assigned",
    };

    return res.status(200).json({ success: true, user:data });
  } catch (error) {
    return next(new AppError("Failed to fetch admin user data", 500));
  }
};
