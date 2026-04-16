import express, { Router } from "express";
import { authenticate ,authorizeAdmin } from "../../../middlewares/authenticate";
import asyncHandler from "../../../utils/asyncHandler";
import * as chatControllers from "../../../controllers/chatControllers/chatController";
import {upload} from "../../../services/s3Upload"


const router = Router();


// Document Vault
router.post("/:visaApplicationId/messageSend"      , authenticate , asyncHandler(chatControllers.msgSend)  );
router.get("/:visaApplicationId/fetchChatMessages" , authenticate , asyncHandler(chatControllers.fetchAllMsg)  );
router.post("/:visaApplicationId/sendFile"         , authenticate , upload.single("file"), asyncHandler(chatControllers.sendFile)  );
router.post("/:messageId/moveToDocVault"           , authenticate , authorizeAdmin ,asyncHandler(chatControllers.moveToDocVault)  );

export default router;