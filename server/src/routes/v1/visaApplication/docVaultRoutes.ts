import express, { Router } from "express";
import { authenticate ,authorizeAdmin } from "../../../middlewares/authenticate";
import asyncHandler from "../../../utils/asyncHandler";
import * as docVaultControllers from "../../../controllers/visaApplications/docVaultController";
import {upload} from "../../../services/s3Upload"
import { handleEligibilityForm } from "../../../controllers/visaApplications/testingEmails"
import { checkPermission } from "../../../middlewares/permissionMiddleware";
import { addArrayForStaff } from "../../../middlewares/addArrayForStaff";
const router = Router();


// Document Vault
router.get("/:visaApplicationId/fetchVaultDocS"  , authenticate , asyncHandler(docVaultControllers.fetchVaultDocS)  );



router.post("/:visaApplicationId/addCategory"    ,
authenticate , authorizeAdmin ,
checkPermission("Write-V"),
addArrayForStaff("VisaApplications"),
asyncHandler(docVaultControllers.createCategory)  );


router.post("/:visaApplicationId/docUploadByUser", authenticate , upload.single("file"), asyncHandler(docVaultControllers.docUploadByUser)  );



router.post("/:categoryId/docUploadByAdmin"      ,
 authenticate , authorizeAdmin ,
 checkPermission("Write-V"),
 addArrayForStaff("VisaApplications"),
 upload.single("file"),
 asyncHandler(docVaultControllers.uploadDocumentToCategory)  );


router.post("/:documentId/moveToAnotherCategory" ,
 authenticate , authorizeAdmin,
 checkPermission("Write-V"),
 addArrayForStaff("VisaApplications"),
 asyncHandler(docVaultControllers.moveDocumentToAnotherCategory)  );


router.get("/:visaApplicationId/fetchAllExtraCategories" ,
 authenticate , authorizeAdmin,
 checkPermission("Read-V"),
 addArrayForStaff("VisaApplications"),
 asyncHandler(docVaultControllers.fetchAllExtraCategories)  );

export default router;