import { NextFunction, Request, Response } from "express";
import mongoose, { Schema, Document } from "mongoose";
import AppError from "../../../utils/appError";
import { UserModel as userModel } from "../../../models/Users";
import bcrypt from "bcryptjs";
import {
  RoleEnum,
  AccountStatusEnum,
  paymentStatus , 
  PaymentSourceEnum
} from "../../../types/enums/enums";
import { sendPortalAccessToClient } from "../../../services/emails/triggers/leads/payment/payment-successful";
import {createVisaApplication} from "../../Leads/paymentFunctions";
import { updateRevenueSummary } from "../../../utils/revenueCalculate";
import { PaymentModel } from "../../../leadModels/paymentModel"
import {RoleModel} from "../../../models/rbacModels/roleModel"

const VISATYPE_MAP: Record<string, string> = {
  "Portugal": "6803644993e23a8417963622",
  "Dubai": "6803644993e23a8417963623",
  "Dominica": "6803644993e23a8417963620", 
  "Grenada": "6803644993e23a8417963621", 
};


// isme currency and Amount store karwana hai...
// and invoice bhi store karwani hai....
export const addNewClient = async (req: Request, res: Response) => {
    
    const { name, email, phone ,nationality, serviceType , amount , currency } = req.body;
    const file = req.file;

    // 1. Check if user already exists
    const existingUser = await userModel.findOne({ email });
    const visaTypeId = VISATYPE_MAP[serviceType];

    if (existingUser) {

      const payment = await PaymentModel.create({
        leadId : null , 
        name :  name ,
        email:  email ,
        amount :  amount ,
        currency : currency ,
        status :  paymentStatus.PAID,
        paymentLink : null , 
        invoiceUrl : (file as any)?.location ,
        paymentIntentId : null  ,
        source : PaymentSourceEnum.DIRECT,
        paymentMethod : "Directly"
      })

        const { visaApplicantInfo } = await createVisaApplication({
          userId: (existingUser._id as mongoose.Types.ObjectId).toString(),
          visaTypeId,
          paymentId : payment._id  as mongoose.Types.ObjectId
        });

        return res.status(200).json({   // change response status 
          message: "User already exists. New visa application created.",
          newApplication : visaApplicantInfo,
        });
    }

    // Get the roleId for CUSTOMER
    const customerRole = await RoleModel.findOne({ roleName: "Customer" });
    if (!customerRole) {
      return res.status(500).json({ message: "Customer role not found in roles collection." });
    }

  
    //  Generate random password
    const randomPassword = Math.random().toString(36).slice(-5); 
  
    //  Hash the password
    const hashedPassword = await bcrypt.hash(randomPassword, 10);
  
    //  Create user in DB
    const user = await userModel.create({
      name,
      email,
      phone,
      nationality ,
      password: hashedPassword,
      role: RoleEnum.USER,
      status: AccountStatusEnum.ACTIVE,
      roleId: customerRole._id
    });
  
    // Send email with credentials
    await sendPortalAccessToClient(user.email, user.name,serviceType , randomPassword)

    

    // update revenueSummary
    await updateRevenueSummary(
      visaTypeId,
      amount ,
      currency
    );

    // store payment in payment model , with source
    const payment = await PaymentModel.create({
      leadId : null , 
      name :  name ,
      email:  email ,
      amount :  amount ,
      currency : currency ,
      status :  paymentStatus.PAID,
      paymentLink : null , 
      invoiceUrl : (file as any)?.location ,
      paymentIntentId : null  ,
      source : PaymentSourceEnum.DIRECT,
      paymentMethod : "Directly"
    })

    // create new visaApplication 
    const { visaApplicantInfo } = await createVisaApplication({
      userId: (user._id as mongoose.Types.ObjectId).toString(),
      visaTypeId,
      paymentId : payment._id  as mongoose.Types.ObjectId
    });

    res.status(201).json({
      message: "Client added successfully and credentials sent via email and newApplication is also created.",
      newUser: user,
      newVisaApplication : visaApplicantInfo,
    });
};


