import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import AppError from "../../utils/appError";
import { VisaApplicationModel } from "../../models/VisaApplication";
// import { VisaTypeModel } from '../../models/VisaType';
// import { VisaApplicationModel } from '../../models/VisaApplication';
// import { StepStatusModel } from '../../models/VisaApplicationStepStatus';
// import { RequirementStatusModel } from '../../models/VisaApplicationReqStatus';
// import AppError from '../../utils/appError';
// import mongoose from 'mongoose';
// import { Types } from "mongoose";
// const { ObjectId } = Types;


// Fetch All visaApplications
export const getAllApplications = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  // Flow :
  // 1) Here we will get access token from frontend via cookies
  // 2) From access token we will take the mongodb userId
  // 3) Then query in Visa Application db and search for all the applications of that userId
  // 4) In each data populate the visa information from vistype db and return data
  try {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) return next(new AppError("Access token missing", 401));

    const userData = jwt.decode(accessToken) as { id: string; role: string };
    if (!userData?.id) return next(new AppError("Invalid token", 403));

    // console.log(userData.id)

    const applications = await VisaApplicationModel.find({
      userId: userData.id,
    })
      .sort({ createdAt: -1 })
      .populate({ path: "visaTypeId", select: "visaType" })
      .exec();

    return res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (err) {
    console.error(err);
    return next(new AppError("Failed to fetch applications", 500));
  }
};


// Fetch completed visaApplications
export const getAllPreviousApplications = async(req: Request,
  res: Response,
  next: NextFunction): Promise<Response | void>=>{
    try {
      const accessToken = req.cookies.accessToken;
      if (!accessToken) return next(new AppError("Access token missing", 401));
  
      const userData = jwt.decode(accessToken) as { id: string; role: string };
      if (!userData?.id) return next(new AppError("Invalid token", 403));
  
      // console.log(userData.id)
  
      const applications = await VisaApplicationModel.find({
        userId: userData.id,
         status: "COMPLETED"
      })
      .sort({ createdAt: -1 })
        .populate({ path: "userId" })
        .populate({ path: "visaTypeId", select: "visaType" })
        .exec();
  
      return res.status(200).json({
        success: true,
        data: applications,
      });
    } catch (err) {
      console.error(err);
      return next(new AppError("Failed to fetch previous applications", 500));
    }    
}


// Fetch Ongoing visaApplications
export const fetchOngoingApplications = async(req: Request,
  res: Response,
  next: NextFunction): Promise<Response | void>=>{
    try {
      const accessToken = req.cookies.accessToken;
      if (!accessToken) return next(new AppError("Access token missing", 401));
  
      const userData = jwt.decode(accessToken) as { id: string; role: string };
      if (!userData?.id) return next(new AppError("Invalid token", 403));
  
      // console.log(userData.id)
  
      const applications = await VisaApplicationModel.find({
        userId: userData.id,
         status: "PENDING"
      })
      .sort({ createdAt: -1 })
        .populate({ path: "userId" })
        .populate({ path: "visaTypeId", select: "visaType" })
        .exec();
  
      return res.status(200).json({
        success: true,
        data: applications,
      });
    } catch (err) {
      console.error(err);
      return next(new AppError("Failed to fetch previous applications", 500));
    }    
}
