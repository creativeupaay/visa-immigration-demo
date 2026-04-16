import { Router } from "express";
import { authenticate ,authorizeAdmin } from "../../../middlewares/authenticate";
import { checkPermission } from "../../../middlewares/permissionMiddleware";
import { addArrayForStaff } from "../../../middlewares/addArrayForStaff";
import asyncHandler from "../../../utils/asyncHandler";
import * as logControllers from "../../../controllers/logControllers/log";


const router = Router();


router.get("/fetchAllLogs",
 authenticate , authorizeAdmin ,
 checkPermission("View_All_Logs"),
 asyncHandler(logControllers.fetchAllLogs));


router.get("/getParticularApplicationLogs/:visaApplicationId",
 authenticate , authorizeAdmin ,
 checkPermission("Read-V"),
 addArrayForStaff("VisaApplications"),
 asyncHandler(logControllers.getParticularApplicationLogs));

 router.get("/getParticularLeadLogs/:leadId",
 authenticate , authorizeAdmin ,
 checkPermission("Read-L"),
 addArrayForStaff("Leads"),
 asyncHandler(logControllers.getParticularLeadLogs));

 

export default router;