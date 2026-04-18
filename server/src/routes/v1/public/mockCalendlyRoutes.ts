import { Router } from "express";
import asyncHandler from "../../../utils/asyncHandler";
import { mockScheduleConsultation } from "../../../controllers/public/mockCalendlyController";

const router = Router();

router.post("/schedule", asyncHandler(mockScheduleConsultation));

export default router;
