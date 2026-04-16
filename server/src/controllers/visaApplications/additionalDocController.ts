import { NextFunction, Request, Response } from "express";
import AppError from "../../utils/appError";

import { additionalDocStatusEnum } from "../../types/enums/enums";
import mongoose from "mongoose";
import { AdditionalDocStatusModel as docStatusModel } from "../../models/additionalDocStatus"
import { AdditionalDocModel as additionalDocModel } from "../../models/additionalDoc"


// 1.upload additional doc
export const uploadAdditionalDoc = async (req: Request, res: Response) => {
    const { visaApplicationId, reqId } = req.params;
    const file = req.file;
  
    if (!req.file ) {
      res.status(400);
      throw new Error("Document file is required.");
    }
  
    const newDoc = await docStatusModel.create({
      docUrl: (file as any).location,
      status: additionalDocStatusEnum.UPLOADED,
      reqId,
      visaApplicationId
    });
  
    res.status(201).json({
      message: "Additional document uploaded successfully.",
      data: newDoc
    });
  };






// 2.fetch particular visaApplication ke docs (docs and status both)
export const fetchAdditionalDocsInfo = async (req: Request, res: Response) => {
  const { visaApplicationId } = req.params;
  const { visaType } = req.body;

  if (!visaType || !visaApplicationId) {
    res.status(400);
    throw new Error("visaType and visaApplicationId are required.");
  }

  const result = await additionalDocModel.aggregate([
    {
      $match: { visaType }
    },
    {
      $lookup: {
        from: "additionaldocstatuses",
        let: { docId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$reqId", "$$docId"] },
                  { $eq: ["$visaApplicationId", new mongoose.Types.ObjectId(visaApplicationId)] }
                ]
              }
            }
          }
        ],
        as: "statusInfo"
      }
    },
    {
      $unwind: {
        path: "$statusInfo",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: "doccategories",
        localField: "categoryId",
        foreignField: "_id",
        as: "categoryInfo"
      }
    },
    {
      $unwind: {
        path: "$categoryInfo",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        docId: "$_id",
        docName: 1,
        required: 1,
        visaType: 1,
        docStatusId: "$statusInfo._id",
        status: "$statusInfo.status",
        docUrl: "$statusInfo.docUrl",
        categoryId: "$categoryInfo._id",
        category: "$categoryInfo.category",
        question: "$categoryInfo.question"
      }
    },
    {
      $group: {
        _id: {
          categoryId: "$categoryId",
          category: "$category",
          question: "$question"
        },
        documents: {
          $push: {
            docId: "$docId",
            docName: "$docName",
            required: "$required",
            visaType: "$visaType",
            docStatusId: "$docStatusId",
            status: "$status",
            docUrl: "$docUrl"
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        categoryId: "$_id.categoryId",
        category: "$_id.category",
        question: "$_id.question",
        documents: 1
      }
    }
  ]);

  res.status(200).json({ success: true, data: result });
};








// 3. update status (from admin side )
export const requestReUpload = async (req: Request, res: Response) => {
  const { docStatusId } = req.params;

  const updatedDoc = await docStatusModel.findByIdAndUpdate(
    docStatusId,
    {
      status: additionalDocStatusEnum.RE_UPLOAD 
    },
    { new: true }
  );

  if (!updatedDoc) {
    res.status(404);
    throw new Error("Document status not found.");
  }

  res.status(200).json({
    message: "Document status updated to re-upload.",
    data: updatedDoc
  });
};



// 4. update status (from admin side )
export const markAsVerified = async (req: Request, res: Response) => {
  const { docStatusId } = req.params;

  const updatedDoc = await docStatusModel.findByIdAndUpdate(
    docStatusId,
    {
      status: additionalDocStatusEnum.VERIFIED 
    },
    { new: true }
  );

  if (!updatedDoc) {
    res.status(404);
    throw new Error("Document status not found.");
  }

  res.status(200).json({
    message: "Document status updated to approved.",
    data: updatedDoc
  });
};


// 5.API for reupload 
// Patch API
export const reuploadAdditionalDoc = async (req: Request, res: Response) => {
  const { docStatusId } = req.params;
  const file = req.file;
  
  if (!req.file ) {
    res.status(400);
    throw new Error("New document file is required.");
  };

  const updated = await docStatusModel.findByIdAndUpdate(
    docStatusId,
    {
      docUrl: (file as any).location,
      status: additionalDocStatusEnum.UPLOADED
    },
    { new: true }
  );

  if (!updated) {
    res.status(404);
    throw new Error("Document status not found.");
  }

  res.status(200).json({
    message: "Document re-uploaded successfully. Status reset to pending.",
    data: updated
  });
};



 







