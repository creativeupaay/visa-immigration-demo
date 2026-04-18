import express, { Router } from "express";
import asyncHandler from "../../../utils/asyncHandler";
import * as mockPaymentControllers from "../../../controllers/public/mockPaymentController";

const router = Router();

router.post("/process", asyncHandler(mockPaymentControllers.mockProcessPayment));
router.post(
	"/process-dubai",
	asyncHandler(mockPaymentControllers.mockProcessDubaiPayment)
);

export default router;
