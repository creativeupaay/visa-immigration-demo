import { Router } from "express";
import { authenticate, authorizeAdmin } from "../../../middlewares/authenticate";
import asyncHandler from "../../../utils/asyncHandler";
import * as UIPermissionsController from "../../../controllers/admin/UIPermission/UIPermissionsController" 

const router = Router();


router.get("/fetchUIPermissions",authenticate,authorizeAdmin,asyncHandler(UIPermissionsController.FetchUIPermissions))

export default router;
