import { Router } from "express";
import {
  authenticate,
  authorizeAdmin,
} from "../../../middlewares/authenticate";
import { checkPermission } from "../../../middlewares/permissionMiddleware";
import { addArrayForStaff } from "../../../middlewares/addArrayForStaff";
import asyncHandler from "../../../utils/asyncHandler";
import * as consultationControllers from "../../../controllers/Leads/consultationController";

const router = Router();

router.get(
  "/fetchAllConsultations",
  authenticate,
  authorizeAdmin,
   checkPermission("View-Consultations"),
   addArrayForStaff("Consultations"),
  asyncHandler(consultationControllers.getAllConsultations)
);

router.post(
  "/:leadId/sendConsultationLink",
  authenticate,
  authorizeAdmin,
  checkPermission("Write-L"),
  addArrayForStaff("Leads"),
  asyncHandler(consultationControllers.sendConsultationLink)
);

router.post(
  "/:consultationId/markConsultationAsCompleted",
  authenticate,
  authorizeAdmin,
  checkPermission("Write-L"),
  addArrayForStaff("Consultations"),
  asyncHandler(consultationControllers.markConsultationAsCompleted)
);

router.get(
  "/fetchConsultationStats",
  authenticate,
  authorizeAdmin,
   checkPermission("View-Consultations"),
  asyncHandler(consultationControllers.getConsultationStats)
);


router.post(
  "/webhook/calendly",
  asyncHandler(consultationControllers.calendlyWebhook)
);



export default router;
