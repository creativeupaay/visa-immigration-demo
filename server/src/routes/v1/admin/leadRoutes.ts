import { Router } from "express";
import {
  authenticate,
  authorizeAdmin,
} from "../../../middlewares/authenticate";
import { checkPermission } from "../../../middlewares/permissionMiddleware";
import { addArrayForStaff } from "../../../middlewares/addArrayForStaff";
import asyncHandler from "../../../utils/asyncHandler";
import * as leadControllers from "../../../controllers/Leads/leadController";

const router = Router();

router.get(
  "/fetchAllLeads",
  authenticate,
  authorizeAdmin,
  checkPermission("View-Leads"),
  addArrayForStaff("Leads"),
  asyncHandler(leadControllers.getAllLeads)
);

router.get(
  "/downloadLeadsReport",
  authenticate,
  authorizeAdmin,
  checkPermission("View-Leads"),
  addArrayForStaff("Leads"),
  asyncHandler(leadControllers.downloadLeadsReport)
);

router.get(
  "/:leadId/fetchParticularLead",
  authenticate,
  authorizeAdmin,
  checkPermission("Read-L"),
  addArrayForStaff("Leads"),
  asyncHandler(leadControllers.getParticularLeadInfo)
);

router.post(
  "/:leadId/rejectLead",
  authenticate,
  authorizeAdmin,
  checkPermission("Write-L"),
  addArrayForStaff("Leads"),
  asyncHandler(leadControllers.rejectLead)
);

router.get(
  "/fetchLeadsStats",
  authenticate,
  authorizeAdmin,
  checkPermission("View-Leads"),
  asyncHandler(leadControllers.getLeadsStats)
);

export default router;
