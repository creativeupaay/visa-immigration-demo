import { Router } from "express";
import { authenticate ,authorizeAdmin } from "../../../middlewares/authenticate";
import { checkPermission } from "../../../middlewares/permissionMiddleware";
import asyncHandler from "../../../utils/asyncHandler";
import * as rbacControllers from "../../../controllers/admin/RBAC/rbacControllers"
import * as rbacInfoControllers from "../../../controllers/admin/RBAC/infoController"
import * as empCreationControlers from "../../../controllers/admin/RBAC/employeeCreation";

const router = Router();

router.post("/addNewRole",
 authenticate ,authorizeAdmin,
 checkPermission("Add_new_Role"),
 asyncHandler(rbacControllers.addNewRole));

 router.get ("/requestOtpForEmpCreation",
 authenticate ,authorizeAdmin,
 checkPermission("Add_new_Admin_User"),
 asyncHandler(empCreationControlers.requestOtpForEmpCreation));

 router.post ("/verifyOtpForEmpCreation",
 authenticate ,authorizeAdmin,
 checkPermission("Add_new_Admin_User"),
 asyncHandler(empCreationControlers.verifyOtpForEmpCreation));

 router.post("/addNewAdminUser/:roleId",
 authenticate ,authorizeAdmin,
 checkPermission("Add_new_Admin_User"),
 asyncHandler(empCreationControlers.addNewAdminUser));
 

router.post("/assignActionsToRole",
  authenticate ,authorizeAdmin,
  checkPermission("Assign_actions_to_existing_Role"),
  asyncHandler(rbacControllers.assignActionsToRole));

router.patch("/editAdminUser/:employeeId",
  authenticate ,authorizeAdmin,
  checkPermission("Edit_Details_of_an_Admin_User"),
  asyncHandler(rbacControllers.editAdminUser));

 router.delete("/deleteAdminUser/:userId",
  authenticate ,authorizeAdmin,
  checkPermission("Delete_an_Admin_User"),
  asyncHandler(rbacControllers.deleteAdminUser));

router.get("/fetchAllFeatures"   , authenticate , authorizeAdmin , asyncHandler(rbacInfoControllers.fetchAllFeatures));
router.get("/fetchAllAdminUsers" , authenticate , authorizeAdmin , asyncHandler(rbacInfoControllers.fetchAllAdminUsers));
router.get("/fetchAllRoles"      , authenticate , authorizeAdmin , asyncHandler(rbacInfoControllers.fetchAllRoles));
router.get("/fetchRoleWisePermissions"      , authenticate , authorizeAdmin , asyncHandler(rbacInfoControllers.fetchRoleWisePermissions));


router.delete("/deleteRole/:roleId",
  authenticate ,authorizeAdmin,
  checkPermission("Delete_a_Role"),
asyncHandler(rbacControllers.deleteRole));

router.patch("/editRoleName/:roleId",
  authenticate ,authorizeAdmin,
  checkPermission("Edit_a_RoleName"),
asyncHandler(rbacControllers.editRoleName));


export default router;
