import { NextFunction, Request, Response } from "express";
import mongoose, { Schema, Document } from "mongoose";
import AppError from "../../../utils/appError";
import { Types } from "mongoose";
import { UserModel as userModel } from "../../../models/Users";
import { RoleModel as roleModel } from "../../../models/rbacModels/roleModel";
import { AdminOtpModel as adminOtpModel } from "../../../models/authModels/adminOtpModel";
import { logNewEmployeeCreated } from "../../../services/logs/triggers/RBAC&TaskLogs/RBAC/New-employee-created";
import bcrypt from "bcryptjs";
import { employeeAccountCreatedEmail } from "../../../services/emails/triggers/admin/RBAC/new-employee-created";
import { sendEmpCreationOtp } from "../../../services/emails/triggers/admin/2FA-otp/sendEmpCreationOtp";
import {
  RoleEnum,
  AccountStatusEnum,
} from "../../../types/enums/enums";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../../utils/jwtUtils";
import jwt from 'jsonwebtoken';


// Three API's 
// 1. Request OtpFor AdminCreation
// 2. Verify-admin-create-otp
// 3. Add New AdminUser


// export const requestOtpForEmpCreation = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ) => {
//     const rootAdminId = req.admin?.id;

//     if (!rootAdminId) {
//       return next(new AppError("Unauthorized access", 401));
//     }

//     const rootAdmin = await userModel.findOne({ _id: rootAdminId, role: RoleEnum.ADMIN });
//     if (!rootAdmin) {
//       return next(new AppError("Root admin not found", 404));
//     }

//     const { email, name } = rootAdmin;

//     // Generate OTP
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();

//     // Otp save karne ke liye model
//     const createdOtpDoc = await adminOtpModel.create({
//       creatorEmail: email,
//       otp,
//       expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 mins
//       verified: false,
//     });

//     console.log("OTP Document Created:", createdOtpDoc);



//     // Send Email to Root Admin
//     await sendEmpCreationOtp({
//       creatorEmail : rootAdmin.email ,
//       otp :  otp ,
//       creatorName : rootAdmin.name , 
//       expiresIn : 5
//     });

//     return res.status(200).json({
//       message: "OTP sent to root admin",
//     });
//   };



//   second API 
// export const verifyOtpForEmpCreation = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ) => {
//     const { otp } = req.body;
//     const adminEmail = req.admin?.email;

//     if (!otp || !adminEmail) {
//       return next(new AppError("OTP and admin identity required", 400));
//     }

//     const record = await adminOtpModel.findOne({
//       creatorEmail: adminEmail,
//       otp,
//       expiresAt: { $gt: Date.now() },
//       verified: false,
//     });

//     if (!record) {
//       return next(new AppError("Invalid or expired OTP", 400));
//     }

//     // Mark OTP as verified
//     record.verified = true;
//     await record.save();

//     // Generate a short-lived token for admin creation
//     const tempToken = jwt.sign(
//       { email: adminEmail, purpose: "CREATE_ADMIN" },
//       process.env.ACCESS_TOKEN_SECRET!,
//       { expiresIn: "5m" }
//     );

//     return res.status(200).json({
//       message: "OTP verified. You can now create admin.",
//       token: tempToken,
//     });
//   };

//   third api - Now api for create new account 
// export const addNewAdminUser = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const tempToken = req.headers["x-create-admin-token"] as string;

//   if (!tempToken) {
//     return next(new AppError("OTP verification token required", 401));
//   }

//   let decoded: { email: string; purpose: string };
//   try {
//     decoded = jwt.verify(tempToken, process.env.ACCESS_TOKEN_SECRET!) as {
//       email: string;
//       purpose: string;
//     };
//   } catch (err) {
//     return next(new AppError("Token expired or invalid", 401));
//   }

//   if (decoded.purpose !== "CREATE_ADMIN") {
//     return next(new AppError("Invalid token purpose", 403));
//   }

//   // ✅ Token verified – continue with admin creation
//   const {
//     name,
//     email,
//     phone,
//     nationality,
//     password,
//   } = req.body;

//   if (!name || !email || !phone) {
//     return next(new AppError("Missing required fields", 400));
//   }

//   const { roleId } = req.params;

//   const existingUser = await userModel.findOne({ email });
//   if (existingUser) {
//     return next(new AppError("User with this email already exists", 409));
//   }

//   const plainPassword = password || Math.floor(10000 + Math.random() * 90000).toString();
//   const hashedPassword = await bcrypt.hash(plainPassword, 10);

//   const roleDoc = await roleModel.findById(roleId);
//   if (!roleDoc) {
//     return next(new AppError(`No role found with ID: ${roleId}`, 400));
//   }

//   const newUser = new userModel({
//     name,
//     email,
//     phone,
//     nationality,
//     password: hashedPassword,
//     UserStatus: AccountStatusEnum.ACTIVE,
//     role: RoleEnum.ADMIN,
//     roleId: roleDoc._id,
//     forgotPasswordToken: null,
//     forgotPasswordExpires: null,
//   });

//   await newUser.save();

//   const refreshToken = generateRefreshToken({
//     id: String(newUser._id),
//     role: newUser.role,
//     roleId: String(newUser.roleId),
//     userName: newUser.name,
//     email : newUser.email
//   });

//   await userModel.findByIdAndUpdate(newUser._id, { refreshToken });

//   await logNewEmployeeCreated({
//     employeeName: newUser.name,
//     roleName: roleDoc.roleName,
//     employeeEmail: newUser.email,
//     doneByName: req.admin?.userName,
//     doneBy: req.admin?.userName,
//   });

//   await employeeAccountCreatedEmail({
//     to: newUser.email,
//     employeeName: newUser.name,
//     email: newUser.email,
//     password: plainPassword,
//     role: roleDoc.roleName,
//     loginUrl: `${process.env.FRONTEND_URL}/login`,
//   });

//   res.status(201).json({
//     message: "Admin user created successfully.",
//     newUser,
//   });
// };




// requestOtpForEmpCreation (GET)
export const requestOtpForEmpCreation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Verify admin authentication (from original code)
    const rootAdminId = req.admin?.id;
    if (!rootAdminId) {
      return next(new AppError("Unauthorized access", 401));
    }

    // 2. Verify admin exists and is root admin (from original code)
    const rootAdmin = await userModel.findOne({
      _id: rootAdminId,
      role: RoleEnum.ADMIN
    });
    if (!rootAdmin) {
      return next(new AppError("Root admin not found", 404));
    }

    // 3. Generate OTP (improved from both versions)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // 4. Store OTP (combined best of both approaches)
    const createdOtpDoc = await adminOtpModel.create({
      creatorEmail: rootAdmin.email,
      otp,
      expiresAt,
      verified: false
    });

    console.log("OTP Document Created:", createdOtpDoc);

    // 5. Send email (using original email format)
    await sendEmpCreationOtp({
      creatorEmail: rootAdmin.email,
      otp: otp,
      creatorName: rootAdmin.name,
      expiresIn: 5
    });

    // 6. Response (consistent with original)
    return res.status(200).json({
      success: true,
      message: "OTP sent to root admin",
      otpExpiry: expiresAt // Added for frontend reference
    });

  } catch (error) {
    console.error("Error in requestOtpForEmpCreation:", error);
    return next(new AppError("Failed to send OTP", 500));
  }
};

// verifyOtpForEmpCreation (POST)
export const verifyOtpForEmpCreation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { otp } = req.body;
    const adminEmail = req.admin?.email;

    // 1. Validate input
    if (!otp || !adminEmail) {
      return next(new AppError("OTP and admin identity required", 400));
    }

    // 2. Find OTP record with buffer time
    const record = await adminOtpModel.findOne({
      creatorEmail: adminEmail,
      otp: otp.trim(), // Trim whitespace
      expiresAt: { $gt: new Date(Date.now() - 60000) }, // 1-minute buffer
      verified: false
    });

    console.log("OTP Verification Query:", {
      creatorEmail: adminEmail,
      otp: otp.trim(),
      expiresAt: { $gt: new Date() },
      verified: false
    });

    if (!record) {
      console.error("OTP Verification Failed - No matching record found");
      return next(new AppError("Invalid or expired OTP", 400));
    }

    // 3. Mark as verified
    record.verified = true;
    await record.save();

    // 4. Generate token (if needed)
    const tempToken = jwt.sign(
      { email: adminEmail, purpose: "CREATE_ADMIN" },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: "5m" }
    );

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      token: tempToken,
      verifiedEmail: adminEmail
    });

  } catch (error) {
    console.error("OTP Verification Error:", error);
    next(new AppError("OTP verification failed", 500));
  }
};


export const addNewAdminUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // const tempToken = req.headers["x-create-admin-token"] as string;
  const { tempToken } = req.body;

  if (!tempToken) {
    return next(new AppError("OTP verification token required", 401));
  }

  let decoded: { email: string; purpose: string };
  try {
    decoded = jwt.verify(tempToken, process.env.ACCESS_TOKEN_SECRET!) as {
      email: string;
      purpose: string;
    };
  } catch (err) {
    return next(new AppError("Token expired or invalid", 401));
  }

  if (decoded.purpose !== "CREATE_ADMIN") {
    return next(new AppError("Invalid token purpose", 403));
  }

  // ✅ Token verified – continue with admin creation
  const {
    name,
    email,
    phone,
    nationality,
    password,
  } = req.body;

  if (!name || !email || !phone) {
    return next(new AppError("Missing required fields", 400));
  }

  const { roleId } = req.params;

  const existingUser = await userModel.findOne({ email });
  if (existingUser) {
    return next(new AppError("User with this email already exists", 409));
  }

  const plainPassword = password || Math.floor(10000 + Math.random() * 90000).toString();
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const roleDoc = await roleModel.findById(roleId);
  if (!roleDoc) {
    return next(new AppError(`No role found with ID: ${roleId}`, 400));
  }

  const newUser = new userModel({
    name,
    email,
    phone,
    nationality,
    password: hashedPassword,
    UserStatus: AccountStatusEnum.ACTIVE,
    role: RoleEnum.ADMIN,
    roleId: roleDoc._id,
    forgotPasswordToken: null,
    forgotPasswordExpires: null,
  });

  await newUser.save();

  const refreshToken = generateRefreshToken({
    id: String(newUser._id),
    role: newUser.role,
    roleId: String(newUser.roleId),
    userName: newUser.name,
    email: newUser.email
  });

  await userModel.findByIdAndUpdate(newUser._id, { refreshToken });

  await logNewEmployeeCreated({
    employeeName: newUser.name,
    roleName: roleDoc.roleName,
    employeeEmail: newUser.email,
    doneByName: req.admin?.userName,
    doneBy: req.admin?.userName,
  });

  await employeeAccountCreatedEmail({
    to: newUser.email,
    employeeName: newUser.name,
    email: newUser.email,
    password: plainPassword,
    role: roleDoc.roleName,
    loginUrl: `${process.env.FRONTEND_URL}/login`,
  });

  res.status(201).json({
    message: "Admin user created successfully.",
    newUser,
  });
};










