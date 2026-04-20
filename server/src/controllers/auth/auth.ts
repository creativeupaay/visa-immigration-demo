import { NextFunction, Request, Response } from "express";
import AppError from "../../utils/appError";
import { UserModel } from "../../models/Users";
// import { TrustedDeviceModel } from "../../models/authModels/trustedDevices";
import bcrypt from "bcrypt";
import { RoleEnum } from "../../types/enums/enums";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwtUtils";
import { sendForgotPasswordEmail } from "../../services/emails/triggers/customer/auth/forgotPassword";
import jwt from "jsonwebtoken";
import { PORTAL_LINK } from "../../config/configLinks";
import mongoose from "mongoose";

// sign-up
export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const data = req.body;

  if (!data.email || !data.password || !data.role || !data.name)
    throw new AppError("Fields not found", 400);

  if (!Object.values(RoleEnum).includes(data.role)) {
    return next(new AppError("Invalid Role", 403));
  }

  const userExist = await UserModel.exists({ email: data.email });
  if (userExist) throw new AppError("User Already registered", 409);

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await UserModel.create({
    name: data.name,
    email: data.email,
    password: hashedPassword,
    role: data.role,
    roleId: data.roleId,
    phone: data.phone
  });

  if (!user) throw new AppError("User not created", 500);

  let accessToken = generateAccessToken({
    id: String(user._id),
    role: user.role,
    roleId: String(user.roleId),
    userName: user.name,
    email: user.email,
  });
  let refreshToken = generateRefreshToken({
    id: String(user._id),
    role: user.role,
    roleId: String(user.roleId),
    userName: user.name,
    email: user.email,
  });

  // Store the refresh token in user document (Optional)
  // await UserModel.findByIdAndUpdate(user._id, { refreshToken });

  return res.status(201).json({
    success: true,
    message: `User created successfuly with role of ${data.role}`,
    accessToken,
  });
};

// export const login = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<Response | void> => {
//   const { email, password, role, deviceId } = req.body;

//   if (!email || !password || !role || !deviceId)
//     return next(new AppError("Fields not found", 400));

//   const user = await UserModel.findOne({ email });
//   if (!user) return next(new AppError("Email id not registered", 404));

//   if (!(await bcrypt.compare(password, user.password)))
//     return next(new AppError("Invalid password", 403));

//   //  Role check
//   if (user.role === RoleEnum.USER) {
//     // No OTP for regular users → direct login
//     const accessToken = generateAccessToken({
//       id: String(user._id),
//       role: user.role,
//       roleId: String(user.roleId),
//       userName: user.name,
//       email : user.email
//     });

//     const refreshToken = generateRefreshToken({
//       id: String(user._id),
//       role: user.role,
//       roleId: String(user.roleId),
//       userName: user.name,
//       email : user.email
//     });

//     await UserModel.findByIdAndUpdate(user._id, { refreshToken });

//     res.cookie("accessToken", accessToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//       maxAge: 2 * 60 * 60 * 1000,
//     });

//     res.cookie("refreshToken", refreshToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Login successful",
//       accessToken,
//       role: user.role,
//     });
//   }

//   //  Admin user — check for trusted device
//   const trusted = await TrustedDeviceModel.findOne({
//     userId: user._id,
//     deviceId,
//     expiresAt: { $gt: new Date() },
//   });

//   if (trusted) {
//     // Trusted device — skip OTP
//     const accessToken = generateAccessToken({
//       id: String(user._id),
//       role: user.role,
//       roleId: String(user.roleId),
//       userName: user.name,
//       email : user.email
//     });

//     const refreshToken = generateRefreshToken({
//       id: String(user._id),
//       role: user.role,
//       roleId: String(user.roleId),
//       userName: user.name,
//       email : user.email
//     });

//     await UserModel.findByIdAndUpdate(user._id, { refreshToken });

//     res.cookie("accessToken", accessToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//       maxAge: 2 * 60 * 60 * 1000,
//     });

//     res.cookie("refreshToken", refreshToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Login successful (trusted device)",
//       accessToken,
//       role: user.role,
//     });
//   }

//   //  Device not trusted → send OTP
//   const otp = Math.floor(100000 + Math.random() * 900000).toString();
//   user.otp = otp;
//   user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 min
//   await user.save();

//   // send email for otp
//   await sendLoginOtp({
//     email : email,
//     otp :otp ,
//     name :  user.name  ,
//     expiresIn : 5
//   });

//   return res.status(200).json({
//     success: true,
//     message: "OTP sent to your email",
//     needsOtp: true,
//   });
// };

// // Verify - otp
// export const verifyOtp = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<Response | void> => {
//   const { email, otp, rememberMe, deviceId } = req.body;

//   if (!email || !otp || !deviceId)
//     return next(new AppError("Missing fields", 400));

//   const user = await UserModel.findOne({ email });
//   if (!user) return next(new AppError("User not found", 404));

//   if (
//     !user.otp ||
//     !user.otpExpiry ||
//     user.otp !== otp ||
//     user.otpExpiry < new Date()
//   ) {
//     return next(new AppError("Invalid or expired OTP", 400));
//   }

//   //  Clear OTP
//   user.otp = null;
//   user.otpExpiry = null;
//   await user.save();

//   //  Save trusted device if rememberMe is true
//   if (rememberMe) {
//     const signedToken = jwt.sign({ deviceId }, process.env.ACCESS_TOKEN_SECRET!, {
//       expiresIn: "90d",
//     });

//     await TrustedDeviceModel.findOneAndUpdate(
//       { userId: user._id, deviceId },
//       {
//         userId: user._id,
//         deviceId,
//         token: signedToken,
//         expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
//       },
//       { upsert: true, new: true }
//     );
//   }

//   // ✅ Issue tokens
//   const accessToken = generateAccessToken({
//     id: String(user._id),
//     role: user.role,
//     roleId: String(user.roleId),
//     userName: user.name,
//     email : user.email
//   });

//   const refreshToken = generateRefreshToken({
//     id: String(user._id),
//     role: user.role,
//     roleId: String(user.roleId),
//     userName: user.name,
//     email : user.email
//   });

//   await UserModel.findByIdAndUpdate(user._id, { refreshToken });

//   res.cookie("accessToken", accessToken, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "strict",
//     maxAge: 2 * 60 * 60 * 1000, // 2 hr
//   });

//   res.cookie("refreshToken", refreshToken, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "strict",
//     maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//   });

//   return res.status(200).json({
//     success: true,
//     message: "OTP verified, login successful",
//     accessToken,
//     role: user.role,
//   });
// };

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const { email, password, role } = req.body;

  if (!email || !password || !role)
    return next(new AppError("Fields not found", 400));

  const user = await UserModel.findOne({ email });
  if (!user) return next(new AppError("Email id not registered", 404));

  const isPasswordValid = await bcrypt.compare(password, user.password);
  const isDemoMode =
    process.env.DEMO_UPLOAD_MODE === "true" || process.env.NODE_ENV !== "production";
  const demoClientPassword = process.env.DEMO_CLIENT_PASSWORD || "Client@12345";
  const canUseDemoClientPassword =
    isDemoMode && user.role === RoleEnum.USER && password === demoClientPassword;

  if (!isPasswordValid && !canUseDemoClientPassword)
    return next(new AppError("Invalid password", 403));

  const generateAndSetTokens = () => {
    const accessToken = generateAccessToken({
      id: String(user._id),
      role: user.role,
      roleId: String(user.roleId),
      userName: user.name,
      email: user.email,
    });

    const refreshToken = generateRefreshToken({
      id: String(user._id),
      role: user.role,
      roleId: String(user.roleId),
      userName: user.name,
      email: user.email,
    });


    const NODE_ENV = process.env.NODE_ENV;
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: NODE_ENV === 'production' || NODE_ENV === 'staging',
      sameSite: NODE_ENV === 'production' ? 'strict' : NODE_ENV === 'staging' ? 'none' : 'lax',
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: NODE_ENV === 'production' || NODE_ENV === 'staging',
      sameSite: NODE_ENV === 'production' ? 'strict' : NODE_ENV === 'staging' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return { accessToken, refreshToken };
  };

  if (user.role === RoleEnum.USER) {
    const { accessToken } = generateAndSetTokens();
    await UserModel.findByIdAndUpdate(user._id, {
      refreshToken: generateAndSetTokens().refreshToken,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      role: user.role,
    });
  }

  const trustedDevice = req.cookies.trustedDevice;

  if (trustedDevice) {
    try {
      const decoded = jwt.verify(trustedDevice, process.env.ACCESS_TOKEN_SECRET!) as any;
      if (decoded.userId === String(user._id)) {
        const { accessToken } = generateAndSetTokens();
        await UserModel.findByIdAndUpdate(user._id, {
          refreshToken: generateAndSetTokens().refreshToken,
        });

        return res.status(200).json({
          success: true,
          message: "Login successful (trusted device)",
          accessToken,
          role: user.role,
        });
      }
    } catch (error) {
      res.clearCookie("trustedDevice");
    }
  }

  const otp = "111111";
  console.log("[DEMO MODE] OTP:", otp);
  user.otp = otp;
  user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  await user.save();

  return res.status(200).json({
    success: true,
    message: "Use OTP: 111111",
    needsOtp: true,
  });
};

// Verify OTP
export const verifyOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const { email, otp, rememberMe } = req.body;

  if (!email || !otp) return next(new AppError("Missing fields", 400));

  const user = await UserModel.findOne({ email });
  if (!user) return next(new AppError("User not found", 404));

  if (!user.otp || !user.otpExpiry || user.otpExpiry < new Date()) {
    return next(new AppError("Invalid or expired OTP", 400));
  }

  if (otp !== "111111") {
    return next(new AppError("Invalid OTP", 400));
  }

  user.otp = null;
  user.otpExpiry = null;
  await user.save();

  if (rememberMe) {
    const trustedToken = jwt.sign(
      {
        userId: user._id,
        trustedAt: new Date().toISOString(),
      },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: "90d" }
    );

    const NODE_ENV = process.env.NODE_ENV;
    res.cookie("trustedDevice", trustedToken, {
      httpOnly: true,
     secure: NODE_ENV === 'production' || NODE_ENV === 'staging',
        sameSite: NODE_ENV === 'production' ? 'strict' : NODE_ENV === 'staging' ? 'none' : 'lax',
      maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
    });
  }

  const accessToken = generateAccessToken({
    id: String(user._id),
    role: user.role,
    roleId: String(user.roleId),
    userName: user.name,
    email: user.email,
  });

  const refreshToken = generateRefreshToken({
    id: String(user._id),
    role: user.role,
    roleId: String(user.roleId),
    userName: user.name,
    email: user.email,
  });

  await UserModel.findByIdAndUpdate(user._id, { refreshToken });

  const NODE_ENV = process.env.NODE_ENV;
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: NODE_ENV === 'production' || NODE_ENV === 'staging',
        sameSite: NODE_ENV === 'production' ? 'strict' : NODE_ENV === 'staging' ? 'none' : 'lax',
    maxAge: 2 * 60 * 60 * 1000, // 2 hours
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
   secure: NODE_ENV === 'production' || NODE_ENV === 'staging',
        sameSite: NODE_ENV === 'production' ? 'strict' : NODE_ENV === 'staging' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return res.status(200).json({
    success: true,
    message: "OTP verified, login successful",
    accessToken,
    role: user.role,
  });
};

// revokeTrustedDevice
// export const revokeTrustedDevice = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<Response | void> => {
//   const { deviceId } = req.body;
//   const userId = req.admin?.id; // assume you're using a `protect` middleware

//   if (!deviceId) return next(new AppError("Device ID required", 400));

//   await TrustedDeviceModel.deleteOne({ userId, deviceId });

//   return res.status(200).json({
//     success: true,
//     message: "Device revoked successfully",
//   });
// };

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return next(new AppError("Refresh token is required", 403));
  }

  try {
    let user = await UserModel.findOne({ refreshToken });

    if (!user) {
      return next(new AppError("Invalid refresh token", 401));
    }

    const payload = verifyRefreshToken(refreshToken);
    const newAccessToken = generateAccessToken({
      id: payload.id,
      role: payload.role,
      roleId: String(user.roleId),
      userName: user.name,
      email: user.email,
    });

    const NODE_ENV = process.env.NODE_ENV;
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: NODE_ENV === 'production' || NODE_ENV === 'staging',
      sameSite: NODE_ENV === 'production' ? 'strict' : NODE_ENV === 'staging' ? 'none' : 'lax',
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
    });

    res.status(200).json({ accessToken: newAccessToken });
  } catch (err: any) {
    next(new AppError("Invalid refresh token", 403));
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const refreshToken = req.cookies.refreshToken;
  console.log(refreshToken);
  if (!refreshToken) {
    return next(new AppError("Refresh token is required", 400));
  }

  try {
    let user = await UserModel.findOneAndUpdate(
      { refreshToken },
      { $unset: { refreshToken: "" } }
    );

    if (!user) {
      return next(new AppError("Invalid refresh token", 401));
    }

    res.status(200).clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res
      .status(200)
      .clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      })
      .json({ message: "Logged out successfully" });
  } catch (err: any) {
    next(new AppError("Error logging out", 500));
  }
};

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user?.id;

  if (!oldPassword || !newPassword) {
    return next(new AppError("old and new passwords are required", 400));
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // is old passord correct
  const isOldPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
  if (!isOldPasswordCorrect) {
    return next(new AppError("Old password is incorrect", 401));
  }

  // hasing passowrd
  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  // updating new password
  user.password = hashedNewPassword;
  const updatedUser = await user.save();
  if (!updatedUser) throw new AppError("Failed to change password", 500);

  return res.status(201).json({
    success: true,
    message: "Password Updated Successfully",
  });
};

// sending email with reset password url
// export const resetPasswordToken = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<Response | void> => {
//   const { email } = req.body;

//   if (!email) throw new AppError("Email not found", 404);

//   const user = await UserModel.findOne({ email: email });
//   if (!user) throw new AppError("Email is not registered", 401);

//   const resetPasswordToken = crypto.randomUUID();

//   const updatedUser = await UserModel.findOneAndUpdate(
//     { email: email },
//     {
//       resetPasswordToken: resetPasswordToken,
//       resetPasswordExpires: Date.now() + 10 * 60 * 1000, // 10 minutes vaidation
//     },
//     { new: true }
//   );

//   const baseURL = process.env.FRONTEND_BASE_URL;
//   const url: string = `${baseURL}/reset-password/${resetPasswordToken}`;

//   if (!updatedUser) throw new AppError("Database operation error", 501);

//   return res.status(200).json({
//     success: true,
//     message: "Reset Passwprd link is sended on registered email",
//   });
// };

// export const resetPassword = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const { password, confirmPassword, token } = req.body;

//   if (!password || !confirmPassword || !token)
//     throw new AppError("Field not found", 404);

//   if (password !== confirmPassword)
//     throw new AppError("Password did'nt match", 401);

//   const userDetail = await UserModel.findOne({ resetPasswordToken: token });
//   if (!userDetail) throw new AppError("User not found", 404);

//   if (userDetail.resetPasswordExpires.getTime() < Date.now())
//     throw new AppError("Link is expired, try again", 402);

//   const hashedPassword = await bcrypt.hash(password, 10);

//   const updatedUser = await UserModel.findOneAndUpdate(
//     { resetPasswordToken: token },
//     {
//       password: hashedPassword,
//       resetPasswordToken: null,
//     },
//     { new: true }
//   );

//   if (!updatedUser) throw new AppError("Failed to update Password", 410);

//   return res.status(200).json({
//     success: true,
//     message: "Password updated successfuly",
//   });
// };

export const fetchUser = async (req: Request, res: Response) => {
  if (req.admin) {
    return res.status(200).json({
      success: true,
      message: "Login successfully",
      role: req?.admin?.role,
    });
  } else if (req.user) {
    return res.status(200).json({
      success: true,
      message: "Login successfully",
      role: req?.user?.role,
    });
  }

  return res.status(401).json({
    success: false,
    message: "User not authenticated",
  });
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    // Find user by email
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User with this email does not exist." });
    }

    // Generate JWT token valid for 10 mins
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: "10m" }
    );

    // Set token and expiry in DB (optional but good for token invalidation)
    user.forgotPasswordToken = token;
    user.forgotPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    // Build reset link
    const resetLink = `${PORTAL_LINK}/reset-password/${token}`;

    //for testing
    // const resetLink =`http://localhost:5173/reset-password/${token}`

    // Send email
    await sendForgotPasswordEmail(user.name, resetLink, user.email);

    return res
      .status(200)
      .json({ message: "Password reset link sent successfully." });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again later." });
  }
};

interface DecodedToken {
  userId: string;
  email: string;
}

export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  try {
    // Check if token and new password are provided
    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ message: "Token and new password are required." });
    }

    // Verify the token
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as DecodedToken;
    // Find user by token
    const user = await UserModel.findOne({
      forgotPasswordToken: token,
      forgotPasswordExpires: { $gt: new Date() }, // Ensure the token hasn't expired
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    // Check if token matches and hasn't expired
    if (decoded.userId !== (user._id as mongoose.Types.ObjectId).toString()) {
      return res
        .status(400)
        .json({ message: "Token does not belong to this user." });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    user.password = hashedPassword;
    user.forgotPasswordToken = null;
    user.forgotPasswordExpires = null;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again later." });
  }
};

// Migrate roleId's
const ROLE_IDS = {
  CUSTOMER: new mongoose.Types.ObjectId("6836a43eec5535328b7e61c5"),
  STAFF: new mongoose.Types.ObjectId("682ecefa53822350b0533a0d"),
  MANAGER: new mongoose.Types.ObjectId("682ecefa53822350b0533a0e"),
  ROOTADMIN: new mongoose.Types.ObjectId("682ecefa53822350b0533a10"),
};

export const fixMissingRoleIds = async (req: Request, res: Response) => {
  const usersWithMissingRoleId = await UserModel.find({
    $or: [{ roleId: null }, { roleId: { $exists: false } }],
  });

  let updatedCount = 0;

  for (const user of usersWithMissingRoleId) {
    let newRoleId;

    switch (user.role) {
      case "USER":
        newRoleId = ROLE_IDS.CUSTOMER;
        break;
      case "ADMIN":
        newRoleId = ROLE_IDS.ROOTADMIN;
        break;
      default:
        console.warn(`Unknown role for user ${user._id}: ${user.role}`);
        continue;
    }

    user.roleId = newRoleId;
    await user.save({ validateBeforeSave: false });
    updatedCount++;
  }

  res.status(200).json({
    message: `RoleId successfully updated for ${updatedCount} users.`,
  });
};
