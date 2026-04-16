import { Router } from "express";
import {
  authenticate,
  authorizeAdmin,
} from "../../../middlewares/authenticate";
import { checkPermission } from "../../../middlewares/permissionMiddleware";
import { addArrayForStaff } from "../../../middlewares/addArrayForStaff";
import asyncHandler from "../../../utils/asyncHandler";
import * as clientsInfo from "../../../controllers/admin/visaType";

const router = Router();

router.get(
  "/fetchAllClients",
  authenticate,
  authorizeAdmin,
  checkPermission("View-Clients"),
  addArrayForStaff("Clients"),
  asyncHandler(clientsInfo.fetchAllClients)
);

router.get(
  "/downloadClientsReport",
  authenticate,
  authorizeAdmin,
  checkPermission("View-Clients"),
  addArrayForStaff("Clients"),
  asyncHandler(clientsInfo.handleDownloadClientsReport)
);

router.get(
  "/fetchClientVisaApplications/:userid",
  authenticate,
  authorizeAdmin,
  checkPermission("View-VisaApplications"),
  addArrayForStaff("VisaApplications"),
  asyncHandler(clientsInfo.fetchClientVisaApplications)
);

export default router;
