import { Router } from "express";
import {
  authenticate,
  authorizeAdmin,
} from "../../../middlewares/authenticate";
import { checkPermission } from "../../../middlewares/permissionMiddleware";
import asyncHandler from "../../../utils/asyncHandler";
import * as bankDetails from "../../../controllers/manageBankDetails/bankDetailsControllers";

const router = Router();

router.get(
  "/fetchBankDetails",
  authenticate,
  authorizeAdmin,
  checkPermission("View_Bank_Details"),
  asyncHandler(bankDetails.getBankDetails)
);

router.put(
  "/editBankDetails/:visaTypeName",
  authenticate,
  authorizeAdmin,
  checkPermission("Edit_Bank_Details"),
  asyncHandler(bankDetails.editBankDetails)
);

export default router;
