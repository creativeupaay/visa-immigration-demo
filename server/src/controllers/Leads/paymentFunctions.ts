import { NextFunction, Request, Response } from "express";
import mongoose, { Schema, model, Document } from "mongoose";
import AppError from "../../utils/appError";
import {
  createPaymentLink,
  createPaymentSession,
} from "../../utils/paymentUtils";
import { LeadModel } from "../../leadModels/leadModel";
import { UserModel } from "../../models/Users";
import { PaymentModel } from "../../leadModels/paymentModel";
import { VisaApplicationModel } from "../../models/VisaApplication";

import { VisaStepModel as stepModel } from "../../models/VisaStep";
import { VisaApplicationStepStatusModel as stepStatusModel } from "../../models/VisaApplicationStepStatus";
import { VisaStepRequirementModel as reqModel } from "../../models/VisaStepRequirement";
import {VisaApplicationReqStatusModel as reqStatusModel} from "../../models/VisaApplicationReqStatus"
import { RoleModel } from "../../models/rbacModels/roleModel";
import {TaskModel } from "../../models/teamAndTaskModels/taskModel"
import {AssignmentModel } from "../../models/teamAndTaskModels/assignModel"
import {
  leadStatus,
  RoleEnum,
  AccountStatusEnum,
  VisaApplicationStatusEnum,
  StepStatusEnum , 
  visaApplicationReqStatusEnum,
  paymentPurpose
} from "../../types/enums/enums";
import { paymentStatus } from "../../types/enums/enums";
import { sendEmail } from "../../utils/sendEmail";
import bcrypt from "bcryptjs";
import Stripe from "stripe";
import { stripe } from "../../utils/paymentUtils";
import { updateRevenueSummary } from "../../utils/revenueCalculate";
import { addToRecentUpdates } from "../../utils/addToRecentUpdates";
import { sendPaymentLinkToLead } from "../../services/emails/triggers/leads/payment/payment-link-send";
import { getServiceType } from "../../utils/leadToServiceType";
import { sendPortalAccessToClient } from "../../services/emails/triggers/leads/payment/payment-successful";
import { handleDubaiPayment } from "../visaApplications/DubaiControllers/paymentController";
import {assignDefaultLead , assignDefaultVisaApplication } from "../../utils/defaultTaskAssign"




export interface createUserOptions {
    name: string;
    email: string;
    role?: RoleEnum;
    UserStatus?: AccountStatusEnum;
    phone:string;
    nationality : string;
    serviceType:string
  }
  
  export async function createUserFunction({
    name,
    email,
    phone,
    nationality , 
    serviceType
  }: createUserOptions): Promise<any> {
    try {
      // 1. Check if user already exists
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        console.log(`User with email ${email} already exists.`);
        return existingUser;
      }
  
      // 1. Generate random password
      const randomPassword = Math.random().toString(36).slice(-5); // example: 'f4g7k'
  
      // 2. Hash the password
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      // Get the roleId for CUSTOMER
      const customerRole = await RoleModel.findOne({ roleName: "Customer" });
      if (!customerRole) {
        console.log("Customer role not found in roles collection.") ;
      }
  
      // 3. Create user in DB
      const user = await UserModel.create({
        name,
        email,
        password: hashedPassword,
        role: RoleEnum.USER,
        status: AccountStatusEnum.ACTIVE,
        phone, 
        roleId : customerRole?._id
      });
  
      console.log(`User-Account created : `, user);
  
      
      await sendPortalAccessToClient(user.email, user.name,serviceType , randomPassword)
  
    //   const html = `
    //   <p>Hello ${name},</p>
    //   <p>Your account has been created.</p>
    //   <p><strong>Email:</strong> ${email}</p>
    //   <p><strong>Password:</strong> ${randomPassword}</p>
    //   <p>Please change your password after login.</p>
    // `;
  
      // 4. Send email with password (optional)
      // await sendEmail({
      //   to: email,
      //   subject: "your account is created",
      //   html,
      // });
  
      console.log(`User ${email} created & email sent.`);
      return user;
    } catch (error) {
      console.error("User creation or email failed:", error);
      throw error;
    }
  }
  
  // const VISATYPE_MAP: Record<string, string> = {
  //   "250912382847462": "6803644993e23a8417963622",
  //   "250901425096454": "6803644993e23a8417963623",
  //   "250912364956463": "6803644993e23a8417963620", // Dominica for now later it will be updated
  // };
  
  const VISATYPE_MAP: Record<string, string> = {
    "Portugal": "6803644993e23a8417963622",
    "Dubai": "6803644993e23a8417963623",
    "Dominica": "6803644993e23a8417963620", 
    "Grenada": "6803644993e23a8417963621", 
  };
  
  // create visaApplication
  
  interface CreateVisaApplicationOptions {
    userId: mongoose.Types.ObjectId | string;
    visaTypeId: mongoose.Types.ObjectId | string;
    leadId ?: mongoose.Types.ObjectId | string | null;
    currentStep?: number; // optional, default 1
    visaApplicationStatus?: VisaApplicationStatusEnum;
    paymentId : mongoose.Types.ObjectId ;
  }
  
  export async function createVisaApplication({
    userId,
    visaTypeId,
    paymentId ,
    leadId 
  }: CreateVisaApplicationOptions): Promise<{ visaApplicantInfo: any }> {
    try {
      
        // step : 1 
        const newApplication = await VisaApplicationModel.create({
          userId: userId ,
          leadId:leadId || null, 
          visaTypeId : new mongoose.Types.ObjectId(visaTypeId),
          currentStep : 1 ,
          status: VisaApplicationStatusEnum.PENDING,
          paymentId : paymentId as mongoose.Types.ObjectId

        });
    
        // 2. Get the visaStep with stepNumber = 1 for this visaTypeId
        const firstStep = await stepModel.findOne({
          visaTypeId: new mongoose.Types.ObjectId(visaTypeId),
          stepNumber: 1,
        });
    
        if (!firstStep) {
          throw new Error("First visa step not found for this visa type");
        }
    
        // 3. Create a StepStatus document
  
        const requiredRequirements = await reqModel.find({
          visaStepId: firstStep._id,
          required: true
        });
        
        const initialReqFilled: Record<string, boolean> = {};
  
        requiredRequirements.forEach((req) => {
          const requirement = req as { _id: mongoose.Types.ObjectId };
          initialReqFilled[requirement._id.toString()] = false;
        });
  
        const stepStatusDoc = await stepStatusModel.create({
          userId: userId,
          visaTypeId: visaTypeId,
          stepId: firstStep._id,
          visaApplicationId: newApplication._id,
          status: StepStatusEnum.IN_PROGRESS,
          reqFilled: initialReqFilled, 
        });
    
        // 4. Fetch all requirements of this step
        const requirements = await reqModel.find({
          visaStepId: firstStep._id,
        });
    
            // Step 5: Create & insert reqStatus for each requirement
        const reqStatusDocs = requirements.map((req) => ({
          userId,
          visaTypeId,
          visaApplicationId: newApplication._id,
          reqId: req._id,
          stepStatusId: stepStatusDoc._id,
          status: visaApplicationReqStatusEnum.NOT_UPLOADED,
          value: null,
          reason : null , 
          stepId : firstStep._id,
        }));
  
        await reqStatusModel.insertMany(reqStatusDocs); 

        // DEFAULT TASK ASSIGNMENT LOGIC
        await assignDefaultVisaApplication(
          newApplication._id as mongoose.Types.ObjectId,
          userId as mongoose.Types.ObjectId
        );
      

        console.log("Visa application & step status created successfully:", newApplication._id);
        console.log("Visa application created successfully:", newApplication);
      
      return { visaApplicantInfo:newApplication }
      // console.log("Visa application created successfully:", newApplication);
    }
    catch (error) {
      console.error("Error creating visa application:", error);
      throw error;
    }
  }