import { Request, Response } from "express";
import mongoose, { Schema, Document, Types } from "mongoose";
import axios from "axios";
import { senderTypeEnum, messageTypeEnum } from "../../types/enums/enums";
import { MessageModel } from "../../models/chatModels/msgModel";
import { CategoryModel as categoryModel } from "../../extraModels/categoryModel";
import { CatDocModel as catDocModel } from "../../extraModels/catDocModel";
import { DocumentSourceEnum } from "../../types/enums/enums";
import moment from "moment";
// Temp saare docs store karwane

export const msgSend = async (req: Request, res: Response) => {
  const { textMsg } = req.body;
  const { visaApplicationId } = req.params;

  let senderId: Types.ObjectId;
  let senderType: senderTypeEnum;

  if (req.admin) {
    senderId = new Types.ObjectId(req.admin.id);
    senderType = senderTypeEnum.ADMIN;
  } else if (req.user) {
    senderId = new Types.ObjectId(req.user.id);
    senderType = senderTypeEnum.USER;
  } else {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const newMessage = await MessageModel.create({
    visaApplicationId: new Types.ObjectId(visaApplicationId),
    senderId,
    senderType,
    messageType: messageTypeEnum.TextMsg,
    textMsg: textMsg,
  });

  res.status(201).json({
    success: true,
    message: "Message sent successfully",
    data: newMessage,
  });
};

export const fetchAllMsg = async (req: Request, res: Response) => {
  const { visaApplicationId } = req.params;

  if (!Types.ObjectId.isValid(visaApplicationId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid visaApplicationId",
    });
  }

  const messages = await MessageModel.aggregate([
    {
      $match: {
        visaApplicationId: new Types.ObjectId(visaApplicationId),
      },
    },
    {
      $project: {
        _id: 1,
        textMsg: 1,
        senderType: 1,
        fileUrl: 1,
        fileName: 1,
        createdAt: 1,
        date: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $group: {
        _id: "$date",
        messages: {
          $push: {
            _id: "$_id",
            textMsg: "$textMsg",
            senderType: "$senderType",
            fileUrl: "$fileUrl",
            fileName: "$fileName",
            createdAt: "$createdAt",
          },
        },
      },
    },
    {
      $sort: { _id: -1 }, // date descending
    },
  ]);

  res.status(200).json({
    success: true,
    data: messages.reduce(
      (acc, curr) => {
        acc[curr._id] = curr.messages;
        return acc;
      },
      {} as Record<string, any[]>
    ),
  });
};

// API for moving document to document vault
export const moveToDocVault = async (req: Request, res: Response) => {
  const { messageId } = req.params;
  const { categoryName, docName } = req.body;

  if (!messageId || !categoryName || !docName) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  // Aggregate message info with required fields
  const result = await MessageModel.aggregate([
    {
      $match: {
        _id: new Types.ObjectId(messageId),
        fileUrl: { $ne: null },
      },
    },
    {
      $project: {
        visaApplicationId: 1,
        fileUrl: 1,
        senderType: 1, // uploaded by kisko rakhna hai ..??
      },
    },
  ]);

  if (result.length === 0) {
    return res
      .status(404)
      .json({ success: false, message: "Message not found or has no file" });
  }

  const { visaApplicationId, fileUrl, senderType } = result[0];

  //  Check or create category using visaApplicationId and categoryName
  let category = await categoryModel.findOne({
    name: categoryName,
    visaApplicationId,
  });

  // if (!category) {
  //   category = await CategoryModel.create({
  //     name: categoryName,
  //     visaApplicationId
  //   });
  // }

  if (!category) {
    return res
      .status(404)
      .json({
        success: false,
        message: `Category not found for this categoryName: ${categoryName}`,
      });
  }

  // Prevent duplicate documents (optional)
  const alreadyExists = await catDocModel.findOne({
    categoryId: category._id,
    url: fileUrl,
  });

  if (alreadyExists) {
    return res
      .status(409)
      .json({ success: false, message: "Document already moved to vault" });
  }

  //  Create document in vault
  const newDoc = await catDocModel.create({
    categoryId: category._id,
    url: fileUrl,
    docName,
    uploadedBy: senderType,
  });

  return res.status(201).json({
    success: true,
    message: "Document moved to Document Vault successfully",
    data: newDoc,
  });
};

// API for sending file
export const sendFile = async (req: Request, res: Response) => {
  const { visaApplicationId } = req.params;

  if (!visaApplicationId || !req.file) {
    return res
      .status(400)
      .json({
        success: false,
        message: "visaApplicationId and file are required",
      });
  }

  const file = req.file;

  let senderId: Types.ObjectId;
  let senderType: senderTypeEnum;

  if (req.admin) {
    senderId = new Types.ObjectId(req.admin.id);
    senderType = senderTypeEnum.ADMIN;
  } else if (req.user) {
    senderId = new Types.ObjectId(req.user.id);
    senderType = senderTypeEnum.USER;
  } else {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const fileUrl = req.file.path; // If using local storage
  const fileName = req.file.originalname;

  const newMessage = await MessageModel.create({
    visaApplicationId: new Types.ObjectId(visaApplicationId),
    senderId,
    senderType,
    messageType: messageTypeEnum.FileMsg,
    fileUrl: (file as any)?.location,
    fileName: (file as any)?.originalname,
    textMsg: null,
  });

  res.status(201).json({ success: true, data: newMessage });
};
