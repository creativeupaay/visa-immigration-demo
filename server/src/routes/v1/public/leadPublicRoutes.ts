import { Router } from "express";
import asyncHandler from "../../../utils/asyncHandler";
import { createDemoLead } from "../../../controllers/public/leadPublicController";

const router = Router();

router.post("/create-demo", asyncHandler(createDemoLead));

export default router;
