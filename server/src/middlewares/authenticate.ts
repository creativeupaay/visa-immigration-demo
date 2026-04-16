import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwtUtils';
import mongoose from "mongoose";
import { JwtPayload } from 'jsonwebtoken';
import AppError from '../utils/appError';
import { RoleEnum } from '../types/enums/enums';

interface TokenPayload {
  id: string;
  role: string;
  roleId : string;
  userName : string;
  email : string
}

// declare global {
//   namespace Express {
//     interface Request {
//       user?: any;
//       admin?: JwtPayload;
//       organization?: any;
//     }
//   }
// }

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
      admin?: TokenPayload;
      organization?: any;
      assignedIds?: mongoose.Types.ObjectId[];

      // RBAC-based flags
      readAllLeads?: boolean;
      readAllVisaApplications?: boolean;
      writeOnAllLeads?: boolean;
      writeOnAllVisaApplications?: boolean;
      
      // For the Admin side table tabs
      isViewAllLeads? : boolean;
      isViewAllConsultations? : boolean;
      isViewAllClients? : boolean;
      isViewAllVisaApplications ? : boolean;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {

  const token = req.cookies["accessToken"]
  
  if (!token) {
    return next(new AppError("Token must be provided", 401));
  }

  try {
    const payload: TokenPayload | null = verifyAccessToken(token);

    if(payload && payload.role === RoleEnum.ADMIN)
    {
      req.admin = payload   // if admin
      return next();
    }
    else if(payload && payload.role === RoleEnum.USER) {
      req.user = payload    // if customer/ user
      return next();
    }
    else {
      return next(new AppError("Unauthorized: Invalid token", 401));
    }
  } catch (err) {
    res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};


// for authorziation of Admin
export const authorizeAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.admin) {
    return next(new AppError("Access denied: Admins only", 403));
  }
  next();
};