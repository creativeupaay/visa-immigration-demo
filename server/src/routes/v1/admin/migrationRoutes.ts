import { Router } from "express";
import { authenticate ,authorizeAdmin } from "../../../middlewares/authenticate";
import { checkPermission } from "../../../middlewares/permissionMiddleware";
import { addArrayForStaff } from "../../../middlewares/addArrayForStaff";
import asyncHandler from "../../../utils/asyncHandler";
import * as migrationControllers from "../../../services/LogsMigration/migrationApi";


const router = Router();


// router.post("/addLogTriggers",
//  asyncHandler(migrationControllers.addLogTriggers));
 

export default router;