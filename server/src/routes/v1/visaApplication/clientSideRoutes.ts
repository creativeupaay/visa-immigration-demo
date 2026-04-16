import express, { Router } from "express";
import { authenticate ,authorizeAdmin } from "../../../middlewares/authenticate";
import asyncHandler from "../../../utils/asyncHandler";
import * as clientSideControllers from "../../../controllers/visaApplications/clientSideController";
import * as domiGrenaControllers from "../../../controllers/visaApplications/domiGrenaController";
import * as deliveryControllers from "../../../controllers/visaApplications/dgDeliveryController";
import * as tradeNameControllers from "../../../controllers/visaApplications/DubaiControllers/tradeNameController";
import * as moaControllers from "../../../controllers/visaApplications/DubaiControllers/moaController";
import * as medicalControllers from "../../../controllers/visaApplications/DubaiControllers/medicalTestController";
import * as paymentControllers from "../../../controllers/visaApplications/DubaiControllers/paymentController";
import {upload} from "../../../services/s3Upload"

const router = Router();

router.post("/:visaApplicationId/moveToNextStep", authenticate ,  asyncHandler(clientSideControllers.moveToNextStep));

// domiGrena investment API'S
router.post("/:stepStatusId/uploadInvoice", authenticate , upload.single("file"), asyncHandler(domiGrenaControllers.uploadInvoice));
router.post("/:stepStatusId/selectOption", authenticate ,  asyncHandler(domiGrenaControllers.selectOption));

// domiGrena Delivery and Shipping API'S
router.post("/:stepStatusId/uploadDeliveryDetails", authenticate ,  asyncHandler(deliveryControllers.uploadDeliveryDetails));


// Dubai - Trade Name
router.post('/:stepStatusId/dubai/trade-name/uploadTradeNameOptions' , authenticate ,  asyncHandler(tradeNameControllers.uploadTradeNameOptions) );
router.post('/:stepStatusId/dubai/trade-name/sendChangeRequest' , authenticate ,  asyncHandler(tradeNameControllers.sendChangeRequest) );
router.get('/:stepStatusId/dubai/trade-name/fetchAssignedTradeName' , authenticate ,  asyncHandler(tradeNameControllers.fetchAssignedTradeName) );

// Dubai - MOA
router.get('/:stepStatusId/dubai/MOA/moaDocumentFetch' , authenticate ,  asyncHandler(moaControllers.moaDocumentFetch) );
router.post('/:stepStatusId/dubai/MOA/uploadSignature' , authenticate , upload.single("file"),  asyncHandler(moaControllers.uploadSignature) );

//  Dubai - Medical Test
router.post("/:stepStatusId/dubai/medical/sendReschedulingReq", authenticate ,  asyncHandler(medicalControllers.sendReschedulingReq));
// Dubai - Payment 
router.post("/:stepStatusId/dubai/payment/proceedToPayment", authenticate ,  asyncHandler(paymentControllers.proceedToPayment));
export default router;