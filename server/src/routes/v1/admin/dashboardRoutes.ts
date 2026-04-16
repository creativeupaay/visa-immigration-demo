import { Router } from "express";
import { authenticate ,authorizeAdmin } from "../../../middlewares/authenticate";
import { checkPermission } from "../../../middlewares/permissionMiddleware";
import asyncHandler from "../../../utils/asyncHandler";
import * as dashboard from "../../../controllers/Leads/dashboardController"
import { addArrayForStaff } from "../../../middlewares/addArrayForStaff";


const router = Router();

router.get("/fetchAllRevenue",
 authenticate , authorizeAdmin ,
 checkPermission("Revenue_By_Location"),
 asyncHandler(dashboard.getAllRevenue));

router.get("/fetchRecentUpdates",
 authenticate , authorizeAdmin ,
  checkPermission("Recent_Data"),
 asyncHandler(dashboard.getRecentUpdates));
 
router.get("/fetchRecentLeads",
 authenticate , authorizeAdmin ,
 checkPermission("View-Leads"),
addArrayForStaff("Leads"),
asyncHandler(dashboard.fetchRecentLeads));

router.get("/fetchRecentConsultions" ,
 checkPermission("View-Consultations"),
 addArrayForStaff("Consultations"),
asyncHandler(dashboard.fetchRecentConsultions));


router.get("/fetchAnalytics",
authenticate , authorizeAdmin ,
  checkPermission("Dashboard_Analytics"),
asyncHandler(dashboard.fetchAnalytics));

export default router;