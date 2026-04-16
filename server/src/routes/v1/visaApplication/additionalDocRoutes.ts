import express, { Router } from "express";
import { authenticate ,authorizeAdmin } from "../../../middlewares/authenticate";
import asyncHandler from "../../../utils/asyncHandler";
import * as additionalDocControllers from "../../../controllers/visaApplications/additionalDocController";
import {upload} from "../../../services/s3Upload"


const router = Router();

// Additional doc routes

router.post("/uploadAdditionalDoc/:visaApplicationId/:reqId"      , authenticate  , upload.single("file") ,  asyncHandler(additionalDocControllers.uploadAdditionalDoc)  );
router.get("/fetchAdditionalDocsInfo/:visaApplicationId"          , authenticate  ,                          asyncHandler(additionalDocControllers.fetchAdditionalDocsInfo)  );
router.post("/requestReUpload/:docStatusId"                       , authenticate  , authorizeAdmin        ,  asyncHandler(additionalDocControllers.requestReUpload)  );
router.post("/markAsVerified/:docStatusId"                        , authenticate  , authorizeAdmin        ,  asyncHandler(additionalDocControllers.markAsVerified)  );
router.patch("/reuploadAdditionalDoc/:docStatusId"                , authenticate  , upload.single("file") ,  asyncHandler(additionalDocControllers.reuploadAdditionalDoc)  );


export default router;