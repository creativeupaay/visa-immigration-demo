import { NextFunction, Request, Response } from "express";
import AppError from "../../utils/appError";
import {  dgInvestStatusEnum ,investmentOptionEnum, StepStatusEnum , VisaTypeEnum} from "../../types/enums/enums"
import {DgInvestmentModel } from "../../extraModels/dgInvestment";
import { VisaApplicationStepStatusModel } from "../../models/VisaApplicationStepStatus";
import { createLogForVisaApplication } from "../../services/logs/triggers/visaApplications/createLogForVisaApplication"
import { Types } from "mongoose";
import { UserModel } from "../../models/Users";

export const selectOption = async (req: Request, res: Response) => {
    const { stepStatusId } = req.params;
    const { investmentOption } = req.body;
  
    if (!investmentOption) {
      res.status(400).json({ message: "investmentOption is required" });
      return;
    }
  
    if (!Object.values(investmentOptionEnum).includes(investmentOption)) {
      res.status(400).json({ message: `Invalid investmentOption. Allowed values: ${Object.values(investmentOptionEnum).join(", ")}` });
      return;
    }
  
    const newInvestment = await DgInvestmentModel.create({
      stepStatusId,
      investmentOption,
      dgInvestStatus: dgInvestStatusEnum.optionSelected,
    });

    if(investmentOption===investmentOptionEnum.REAL_STATE){
      await VisaApplicationStepStatusModel.findByIdAndUpdate(stepStatusId, {
        $set: { status: StepStatusEnum.SUBMITTED },
      });
    }

    // aggregate all log-related data 
    const [data] = await VisaApplicationStepStatusModel.aggregate([
      { 
        $match: { _id: new Types.ObjectId(stepStatusId) } 
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "client",
        },
      },
      { $unwind: "$client" },

      /* visaType */
      {
        $lookup: {
          from: "visatypes",
          localField: "visaTypeId",
          foreignField: "_id",
          as: "visaType",
        },
      },
      { $unwind: "$visaType" },

      /* visaStep (stepName + logTriggers) */
      {
        $lookup: {
          from: "visasteps",
          localField: "stepId",
          foreignField: "_id",
          as: "visaStep",
        },
      },
      { $unwind: "$visaStep" },

      {
        $project: {
          _id: 0,
          clientName: "$client.name",
          visaType: "$visaType.visaType",   
          stepName: "$visaStep.stepName",
          logTriggers: "$visaStep.logTriggers",
          visaApplicationId: "$visaApplicationId",
        },
      },
    ]);

    const clientName  = data?.clientName  ;
    const visaType    = data?.visaType    ;
    const stepName    = data?.stepName    ;
    const triggers    = data?.logTriggers ;
    const visaApplicationId = data?.visaApplicationId;

    //4. admin name 
    let adminName = "";
    if (req.admin?.id) {
      const adminDoc = await UserModel.findById(req.admin.id)
        .select("name")
        .lean();
      adminName = adminDoc?.name ?? "";
    }

    // write log 
    await createLogForVisaApplication({
      triggers : triggers,
      clientName : clientName,
      visaType: visaType as unknown as VisaTypeEnum, 
      stepName : stepName ,
      stepStatus: dgInvestStatusEnum.optionSelected, 
      adminName : adminName,
      doneBy: req.admin?.userName || req.user?.userName ,
      visaApplicationId ,
    });
  
    res.status(201).json({
      message: "Investment option selected successfully",
      data: newInvestment,
    });  
   
};




export const addOptionsForRealState = async (req: Request, res: Response) => {
    const { stepStatusId } = req.params;
    const { realStateOptions } = req.body;
  
    if (!Array.isArray(realStateOptions)) {
      res.status(400).json({ message: "realStateOptions must be an array" });
      return;
    }
  
    const updatedInvestment = await DgInvestmentModel.findOneAndUpdate(
      { stepStatusId },
      {
        realStateOptions,
        dgInvestStatus: dgInvestStatusEnum.realStateOptionsUploaded,
      },
      { new: true }
    );
  
    if (!updatedInvestment) {
      res.status(404).json({ message: "Investment not found for given stepStatusId" });
      return;
    }

    await VisaApplicationStepStatusModel.findByIdAndUpdate(stepStatusId, {
      $set: { status: StepStatusEnum.IN_PROGRESS },
    });

    // aggregate all log-related data 
    const [data] = await VisaApplicationStepStatusModel.aggregate([
      { 
        $match: { _id: new Types.ObjectId(stepStatusId) } 
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "client",
        },
      },
      { $unwind: "$client" },

      /* visaType */
      {
        $lookup: {
          from: "visatypes",
          localField: "visaTypeId",
          foreignField: "_id",
          as: "visaType",
        },
      },
      { $unwind: "$visaType" },

      /* visaStep (stepName + logTriggers) */
      {
        $lookup: {
          from: "visasteps",
          localField: "stepId",
          foreignField: "_id",
          as: "visaStep",
        },
      },
      { $unwind: "$visaStep" },

      {
        $project: {
          _id: 0,
          clientName: "$client.name",
          visaType: "$visaType.visaType",   
          stepName: "$visaStep.stepName",
          logTriggers: "$visaStep.logTriggers",
          visaApplicationId: "$visaApplicationId",
        },
      },
    ]);

    const clientName  = data?.clientName  ;
    const visaType    = data?.visaType    ;
    const stepName    = data?.stepName    ;
    const triggers    = data?.logTriggers ;
    const visaApplicationId = data?.visaApplicationId;

    //4. admin name 
    let adminName = "";
    if (req.admin?.id) {
      const adminDoc = await UserModel.findById(req.admin.id)
        .select("name")
        .lean();
      adminName = adminDoc?.name ?? "";
    }

    //write log 
    await createLogForVisaApplication({
      triggers : triggers,
      clientName : clientName,
      visaType: visaType as unknown as VisaTypeEnum, 
      stepName : stepName ,
      stepStatus: dgInvestStatusEnum.realStateOptionsUploaded, 
      adminName : adminName,
      doneBy: req.admin?.userName || req.user?.userName ,
      visaApplicationId,
    });
  
    res.status(200).json({
      message: "Real state options added successfully",
      data: updatedInvestment,
    });
  };




export const uploadInvoice = async (req: Request, res: Response) => {
    const { stepStatusId } = req.params;

    if (!req.file) {
      res.status(400).json({ message: "No invoice file uploaded" });
      return;
    }
    const file = req.file;
    // Use `location` if using S3, otherwise fallback to `path`
    const invoiceUrl = (file as any).location;
  
    const updatedInvestment = await DgInvestmentModel.findOneAndUpdate(
      { stepStatusId },
      { invoiceUrl },
      { new: true }
    );
  
    if (!updatedInvestment) {
      res.status(404).json({ message: "Investment not found for given stepStatusId" });
      return;
    }
    
    await VisaApplicationStepStatusModel.findByIdAndUpdate(stepStatusId, {
      $set: { status: StepStatusEnum.SUBMITTED },
    })


    // aggregate all log-related data 
    const [data] = await VisaApplicationStepStatusModel.aggregate([
      { 
        $match: { _id: new Types.ObjectId(stepStatusId) } 
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "client",
        },
      },
      { $unwind: "$client" },

      /* visaType */
      {
        $lookup: {
          from: "visatypes",
          localField: "visaTypeId",
          foreignField: "_id",
          as: "visaType",
        },
      },
      { $unwind: "$visaType" },

      /* visaStep (stepName + logTriggers) */
      {
        $lookup: {
          from: "visasteps",
          localField: "stepId",
          foreignField: "_id",
          as: "visaStep",
        },
      },
      { $unwind: "$visaStep" },

      {
        $project: {
          _id: 0,
          clientName: "$client.name",
          visaType: "$visaType.visaType",   
          stepName: "$visaStep.stepName",
          logTriggers: "$visaStep.logTriggers",
          visaApplicationId: "$visaApplicationId",
        },
      },
    ]);

    const clientName  = data?.clientName  ;
    const visaType    = data?.visaType    ;
    const stepName    = data?.stepName    ;
    const triggers    = data?.logTriggers ;
    const visaApplicationId = data?.visaApplicationId;

    //4. admin name 
    let adminName = "";
    if (req.admin?.id) {
      const adminDoc = await UserModel.findById(req.admin.id)
        .select("name")
        .lean();
      adminName = adminDoc?.name ?? "";
    }

    //write log 
    await createLogForVisaApplication({
      triggers : triggers,
      clientName : clientName,
      visaType: visaType as unknown as VisaTypeEnum, 
      stepName : stepName ,
      stepStatus: dgInvestStatusEnum.paymentDone, 
      adminName : adminName,
      doneBy: req.admin?.userName || req.user?.userName ,
      visaApplicationId ,
    });
  
    res.status(200).json({
      message: "Invoice uploaded successfully",
      data: updatedInvestment,
    });
  };
  












  
  
  