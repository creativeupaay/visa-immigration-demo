import express, { Router } from "express";
import { authenticate ,authorizeAdmin } from "../../../middlewares/authenticate";
import { checkPermission } from "../../../middlewares/permissionMiddleware";
import { isAssigned } from "../../../middlewares/isAssigned";
import asyncHandler from "../../../utils/asyncHandler";
import * as clientSideControllers from "../../../controllers/visaApplications/clientSideController";
import * as adminSideControllers from "../../../controllers/visaApplications/adminSideController";
import * as domiGrenaControllers from "../../../controllers/visaApplications/domiGrenaController";
import * as deliveryControllers from "../../../controllers/visaApplications/dgDeliveryController";
import * as moaControllers from "../../../controllers/visaApplications/DubaiControllers/moaController";
import * as tradeNameControllers from "../../../controllers/visaApplications/DubaiControllers/tradeNameController";
import * as medicalControllers from "../../../controllers/visaApplications/DubaiControllers/medicalTestController";
import * as paymentControllers from "../../../controllers/visaApplications/DubaiControllers/paymentController";
import * as docVaultControllers from "../../../controllers/visaApplications/docVaultController";
import {upload} from "../../../services/s3Upload"
import { handleEligibilityForm } from "../../../controllers/visaApplications/testingEmails"

const router = Router();

router.get("/:visaApplicationId/getCurrentStepInfo" , authenticate ,  checkPermission("Read-V") ,                         asyncHandler(clientSideControllers.getCurrentStepInfo));
router.post("/submitRequirements", authenticate ,  checkPermission("Write-V"),                         asyncHandler(clientSideControllers.submitRequirements));
router.post("/:reqStatusId/uploadDocument"          , authenticate ,  checkPermission("Write-V"),  upload.single("file"), asyncHandler(clientSideControllers.uploadDocument));
router.post("/:visaApplicationId/stepSubmit"        , authenticate ,  checkPermission("Write-V"),                         asyncHandler(clientSideControllers.stepSubmit));
router.post("/:visaApplicationId/approveStep"       , authenticate ,  checkPermission("Write-V"),                         asyncHandler(adminSideControllers.approveStep) );



// domiGrena Delivery and Shipping API'S
router.get("/:stepStatusId/fetchBothDetails"                    , authenticate , checkPermission("Read-V") ,  asyncHandler(deliveryControllers.fetchBothDetails));

// Dubai - TradeName
router.get("/:stepStatusId/dubai/trade-name/fetchTradeNameInfo" , authenticate , checkPermission("Read-V") ,  asyncHandler(tradeNameControllers.fetchTradeNameInfo));

// Dubai - MOA
router.get("/:stepStatusId/dubai/moa/fetchSigAndMOA"            , authenticate , checkPermission("Read-V") ,  asyncHandler(moaControllers.fetchSigAndMOA));

// Dubai -  Medical
router.get("/:stepStatusId/dubai/medical/fetchMedicalTestInfo"  , authenticate , checkPermission("Read-V") ,  asyncHandler(medicalControllers.fetchMedicalTestInfo));

// Dubai -  Payments
router.get("/:stepStatusId/dubai/payment/fetchPaymentInfo"      , authenticate , checkPermission("Read-V") ,  asyncHandler(paymentControllers.getPaymentStepInfo));

// Documents vault



// route for testing emails 
router.post('/eligibility-form', asyncHandler(handleEligibilityForm) );



export default router;