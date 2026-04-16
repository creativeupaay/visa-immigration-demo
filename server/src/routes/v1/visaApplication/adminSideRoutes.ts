import express, { Router } from "express";
import { authenticate ,authorizeAdmin } from "../../../middlewares/authenticate";
import asyncHandler from "../../../utils/asyncHandler";
import { checkPermission } from "../../../middlewares/permissionMiddleware";
import { isAssigned } from "../../../middlewares/isAssigned";
import { addArrayForStaff } from "../../../middlewares/addArrayForStaff";
import * as adminSideControllers from "../../../controllers/visaApplications/adminSideController";
import * as domiGrenaControllers from "../../../controllers/visaApplications/domiGrenaController";
import * as deliveryControllers from "../../../controllers/visaApplications/dgDeliveryController";
import * as portugalControllers from "../../../controllers/visaApplications/portugalController";
import * as tradeNameControllers from "../../../controllers/visaApplications/DubaiControllers/tradeNameController";
import * as moaControllers       from "../../../controllers/visaApplications/DubaiControllers/moaController";
import * as medicalControllers from "../../../controllers/visaApplications/DubaiControllers/medicalTestController";
import * as paymentControllers from "../../../controllers/visaApplications/DubaiControllers/paymentController";

import {upload} from "../../../services/s3Upload"

const router = Router();


router.post("/:visaApplicationId/rejectStep",  authenticate , authorizeAdmin ,checkPermission("Write-V"), asyncHandler(adminSideControllers.rejectStep) );


router.post("/:reqStatusId/markAsVerified",  authenticate , authorizeAdmin , checkPermission("Write-V") , asyncHandler(adminSideControllers.markAsVerified) );
router.post("/:reqStatusId/needsReupload" ,  authenticate , authorizeAdmin , checkPermission("Write-V") , asyncHandler(adminSideControllers.needsReupload) );

// domiGrena investment API'S
router.post("/:stepStatusId/addOptionsForRealState", authenticate ,authorizeAdmin ,checkPermission("Write-V"),  asyncHandler(domiGrenaControllers.addOptionsForRealState));

// domiGrena Delivery and Shipping API'S
router.post("/:stepStatusId/uploadShippingDetails", authenticate , authorizeAdmin,checkPermission("Write-V"), asyncHandler(deliveryControllers.uploadShippingDetails));
// Portugal AIMA 
router.post('/:aimaId/updateStatus' , authenticate , authorizeAdmin ,checkPermission("Write-V"), asyncHandler(portugalControllers.updateStatus) );


// Dubai- Trade Name
router.get('/:stepStatusId/dubai/trade-name/fetchTradeNameOptions' , authenticate , authorizeAdmin , checkPermission("Read-V") , asyncHandler(tradeNameControllers.fetchTradeNameOptions) );
router.post('/:stepStatusId/dubai/trade-name/assignOneTradeName'   , authenticate , authorizeAdmin , checkPermission("Write-V"), asyncHandler(tradeNameControllers.assignOneTradeName) );
router.post('/:stepStatusId/dubai/trade-name/approveChangeReq'     , authenticate , authorizeAdmin , checkPermission("Write-V"), asyncHandler(tradeNameControllers.approveChangeReq) );
router.post('/:stepStatusId/dubai/trade-name/rejectChangeReq'      , authenticate , authorizeAdmin , checkPermission("Write-V"), asyncHandler(tradeNameControllers.rejectChangeReq) );

// Dubai - MOA
router.post('/:stepStatusId/dubai/MOA/moaUpload'        , authenticate , authorizeAdmin , checkPermission("Write-V") , upload.single("file"), asyncHandler(moaControllers.moaUpload) );
router.post('/:stepStatusId/dubai/MOA/approveSignature' , authenticate , authorizeAdmin , checkPermission("Write-V") , asyncHandler(moaControllers.approveSignature) );

// Dubai - Medical Test
router.post("/:stepStatusId/dubai/medical/uploadMedicalTestDetails", authenticate , authorizeAdmin , checkPermission("Write-V") ,  asyncHandler(medicalControllers.uploadMedicalTestDetails));
router.post("/:stepStatusId/dubai/medical/markTestAsCompleted"     , authenticate , authorizeAdmin , checkPermission("Write-V") ,  asyncHandler(medicalControllers.markTestAsCompleted));
router.post("/:stepStatusId/dubai/medical/approveReschedulingReq"  , authenticate , authorizeAdmin , checkPermission("Write-V") ,  asyncHandler(medicalControllers.approveReschedulingReq));
router.post("/:stepStatusId/dubai/medical/approveReschedulingReq"  , authenticate , authorizeAdmin , checkPermission("Write-V") ,  asyncHandler(medicalControllers.approveReschedulingReq));


// Dubai - Payment
router.post("/:stepStatusId/dubai/payment/sendPaymentLink", authenticate , authorizeAdmin , checkPermission("Write-V") , asyncHandler(paymentControllers.handleSendPaymentLink));
export default router;




