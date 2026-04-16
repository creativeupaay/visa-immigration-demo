import { Router } from "express";
import { authenticate, authorizeAdmin } from "../../../middlewares/authenticate";
import asyncHandler from "../../../utils/asyncHandler";
import * as adminProfile from  "../../../controllers/admin/adminProfile/adminProfileController" 

const router = Router();


router.get("/fetchAdminProfile",authenticate,authorizeAdmin,asyncHandler(adminProfile.fetchAdminProfile))

export default router;
