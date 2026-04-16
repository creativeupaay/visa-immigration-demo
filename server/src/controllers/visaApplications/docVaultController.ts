import { NextFunction, Request, Response } from "express";
import AppError from "../../utils/appError";
import mongoose from "mongoose";
import { VisaApplicationStepStatusModel as stepStatusModel } from "../../models/VisaApplicationStepStatus";
import { VisaApplicationModel as visaApplicationModel } from "../../models/VisaApplication";
import { VisaStepModel as stepModel } from "../../models/VisaStep";
import { VisaStepRequirementModel as reqModel } from "../../models/VisaStepRequirement";
import { VisaApplicationReqStatusModel as reqStatusModel } from "../../models/VisaApplicationReqStatus";
import { StepStatusEnum , DocumentSourceEnum } from "../../types/enums/enums";
import { CategoryModel as categoryModel } from "../../extraModels/categoryModel";
import { CatDocModel as catDocModel } from "../../extraModels/catDocModel";

export const fetchVaultDocS = async (req: Request, res: Response) => {

  type StepGroup = {
    stepNumber: number;
    documents: {
      reqId: string;
      fileName: string;
      status: string;
      uploadedAt: string;
    }[];
  };
  
  const result: {
    adminUploaded: Record<string, StepGroup>;
    userUploaded: Record<string, StepGroup>;
  } = {
    adminUploaded: {},
    userUploaded: {}
  };
  
    const { visaApplicationId } = req.params;
  
    if (!mongoose.Types.ObjectId.isValid(visaApplicationId)) {
      return res.status(400).json({ success: false, message: "Invalid visaApplicationId" });
    }
  
    // Step 1: Get the visaApplication to find visaTypeId
    const visaApplication = await visaApplicationModel.findById(visaApplicationId).lean();
  
    if (!visaApplication) {
      return res.status(404).json({ success: false, message: "Visa Application not found" });
    }
  
    const visaTypeId = visaApplication.visaTypeId;
  
    // Step 2: Fetch all steps for the visaTypeId
    const steps = await stepModel.find({ visaTypeId }).lean();
  
    // Step 3: Aggregate uploaded documents grouped by stepId
    const uploadedDocs = await reqStatusModel.aggregate([
      {
        $match: {
          visaApplicationId: new mongoose.Types.ObjectId(visaApplicationId),
          value: { $ne: null }
        }
      },
      {
        $lookup: {
          from: "visasteps",
          localField: "stepId",
          foreignField: "_id",
          as: "step"
        }
      },
      { $unwind: "$step" },
      {
        $lookup: {
          from: "visasteprequirements",
          localField: "reqId",
          foreignField: "_id",
          as: "req"
        }
      },
      { $unwind: "$req" },
      {
        $project: {
          _id: 1,
          reqId: 1,
          value: 1,
          status: 1,
          uploadedAt: "$updatedAt", // no need , we didn't use timpstamp : true
          stepName: "$step.stepName",
          question : "$req.question",
          uploadedBy: {
            $cond: [
              { $eq: ["$step.stepSource", "ADMIN"] },
              "adminUploaded",
              "userUploaded"
            ]
          }
        }
      },
      {
        $group: {
          _id: { stepName: "$stepName", uploadedBy: "$uploadedBy" },
          documents: {
            $push: {
              question : "$question",
              value: "$value",
              // status: "$status",
              // uploadedAt: "$uploadedAt"
            }
          }
        }
      }
    ]);
  
    // Step 4: Structure result with all stepNames initialized
    // const result = {
    //   adminUploaded: {} as Record<string, any[]>,
    //   userUploaded: {} as Record<string, any[]>
    // };
    
    // prepare empty arrays per step
    for (const step of steps) {
      result.adminUploaded[step.stepName] = {
        stepNumber: step.stepNumber,
        documents: []
      };
      result.userUploaded[step.stepName] = {
        stepNumber: step.stepNumber,
        documents: []
      };
    }
  
    for (const docGroup of uploadedDocs) {
      const { stepName, uploadedBy } = docGroup._id;
      // Explicitly type the uploadedBy to "adminUploaded" | "userUploaded"
      if (uploadedBy === "adminUploaded" || uploadedBy === "userUploaded") {

        const uploadedByKey = uploadedBy as "adminUploaded" | "userUploaded";

        if (result[uploadedByKey][stepName]) {
          result[uploadedByKey][stepName].documents = docGroup.documents;
        }
      }
    }

    // Now , also return category wise documents 
    const categoryWiseDocs = await categoryModel.aggregate([
      {
        $match: {
          visaApplicationId: new mongoose.Types.ObjectId(visaApplicationId),
        },
      },
      {
        $lookup: {
          from: "categorydocuments", 
          localField: "_id",
          foreignField: "categoryId",
          as: "documents",
        },
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);
  
  
    return res.status(200).json({
      success: true,
      result , 
      categoryWiseDocs,
    });
  };





// Add category  -->> {only admin }
export const createCategory = async (req: Request, res: Response) => {
  const { visaApplicationId } = req.params;
  const { categoryName } = req.body;

  if (!categoryName || !visaApplicationId) {
      res.status(400);
      throw new Error("Name and visaApplicationId are required.");
  }

  const category = await categoryModel.create({ name : categoryName, visaApplicationId });
  res.status(201).json({ message: "Category created successfully", category });
};



// this is kind of utility function
export const getOrCreateAdditionalDocsCategory = async (visaApplicationId: string) => {
  let category = await categoryModel.findOne({
      visaApplicationId,
      name: "Additional Docs"
  });

  if (!category) {
      category = await categoryModel.create({
          visaApplicationId,
          name: "Additional Docs"
      });
  }

  return category;
};



// Upload Document...(Only User can do this)
export const docUploadByUser = async (req: Request, res: Response) => {
  const { visaApplicationId } = req.params;
  const { documentName } = req.body;
  const file = req.file;

  if (!visaApplicationId) {
      res.status(400);
      throw new Error("visaApplicationId and url are required.");
  }

  if (!documentName) {
    res.status(400);
    throw new Error("documentName is required.");
  }

  const category = await getOrCreateAdditionalDocsCategory(visaApplicationId);

  const doc = await catDocModel.create({
      categoryId: category._id,
      url : (file as any).location ,
      docName:documentName,
      uploadedBy: req.user?.role // isko check karna hai...
  });

  res.status(201).json({ message: "Document uploaded successfully", doc });
};


  // upload in particular category... (Only Admin can do this )
  export const uploadDocumentToCategory = async (req: Request, res: Response) => {
    const { categoryId } = req.params;
    const { documentName } = req.body;
    const file = req.file;
  
    const category = await categoryModel.findById(categoryId);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    if (!documentName) {
      res.status(400);
      throw new Error("documentName is required.");
    }
  
    const newDoc = await catDocModel.create({
      categoryId,
      url: (file as any).location ,
      docName:documentName,
      uploadedBy:DocumentSourceEnum.ADMIN
    });
  
    res.status(201).json({
      success: true,
      message: "Document uploaded successfully",
      data: newDoc,
    });
  };

  // move to category....(Only Admin can do this )
  export const moveDocumentToAnotherCategory = async (req: Request, res: Response) => {
    const { documentId } = req.params;
    const { newCategoryId } = req.body;
  
    const document = await catDocModel.findById(documentId);
    if (!document) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }
  
    const newCategory = await categoryModel.findById(newCategoryId);
    if (!newCategory) {
      return res.status(404).json({ success: false, message: "Target category not found" });
    }
  
    document.categoryId = newCategoryId;
    await document.save();
  
    res.status(200).json({
      success: true,
      message: "Document moved successfully",
      data: document,
    });
  };

export const fetchAllExtraCategories = async (req: Request, res: Response) => {
  const { visaApplicationId } = req.params;

  try {
    if (!visaApplicationId) {
      return res.status(400).json({ message: "visaApplicationId is required" });
    }

    const categories = await categoryModel.find({ visaApplicationId });

    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}; 


        
  