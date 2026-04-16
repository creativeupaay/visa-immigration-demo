import express, { Router } from "express";
import { authenticate ,authorizeAdmin } from "../../../middlewares/authenticate";
import { checkPermission } from "../../../middlewares/permissionMiddleware";
import { addArrayForStaff } from "../../../middlewares/addArrayForStaff";
import asyncHandler from "../../../utils/asyncHandler";
import * as paymentControllers from "../../../controllers/Leads/paymentController";


const router = Router();

// router.post("/webhook/stripe",express.raw({ type: 'application/json' }), asyncHandler(paymentControllers.handleStripeWebhook));

router.post("/:leadId/sendPaymentLink",
 authenticate , authorizeAdmin ,
  checkPermission("Write-L"),
  addArrayForStaff("Leads"),
 asyncHandler(paymentControllers.sendPaymentLink));

// This is for Customer -->> no need of role management
router.post("/:leadId/proceedToPayment",asyncHandler(paymentControllers.proceedToPayment));

// view invoice 
router.get("/:paymentId/viewInvoice",
authenticate , authorizeAdmin ,
 asyncHandler(paymentControllers.viewInvoice));
export default router;