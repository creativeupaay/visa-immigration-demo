import { Router } from "express";
import {
  authenticate,
  authorizeAdmin,
} from "../../../middlewares/authenticate";
import { checkPermission } from "../../../middlewares/permissionMiddleware";
import asyncHandler from "../../../utils/asyncHandler";
import * as taskControllers from "../../../controllers/admin/teamAndTaskControllers/taskController";
import * as taskInfoControllers from "../../../controllers/admin/teamAndTaskControllers/taskInfoController";
import * as otherInfoControllers from "../../../controllers/admin/teamAndTaskControllers/otherInfoController";
import { addArrayForStaff } from "../../../middlewares/addArrayForStaff";
import { upload } from "../../../services/s3Upload";

const router = Router();

router.post(
  "/addNewTask",
  authenticate,
  authorizeAdmin,
  checkPermission("Create_task"),
  upload.array("files"),
  asyncHandler(taskControllers.addNewTask)
);

router.patch(
  "/editTask/:taskId",
  authenticate,
  authorizeAdmin,
  checkPermission("Edit_task"),
  upload.array("files"),
  asyncHandler(taskControllers.editTask)
);

router.delete(
  "/deleteTask/:taskId",
  authenticate,
  authorizeAdmin,
  checkPermission("Delete_task"),
  asyncHandler(taskControllers.deleteTask)
);

//  Fetch  Tasks
router.get(
  "/fetchAllTasks",
  authenticate,
  authorizeAdmin,
  asyncHandler(taskInfoControllers.fetchAllTasks)
);
router.get(
  "/fetchMyTasks",
  authenticate,
  authorizeAdmin,
  asyncHandler(taskInfoControllers.fetchMyTasks)
);

router.get(
  "/fetchUpcomingTasks",
  authenticate,
  authorizeAdmin,
  addArrayForStaff("Tasks"),
  asyncHandler(taskInfoControllers.fetchUpcomingTasks)
);

router.get(
  "/fetchDueTasks",
  authenticate,
  authorizeAdmin,
  addArrayForStaff("Tasks"),
  asyncHandler(taskInfoControllers.fetchDueTasks)
);

router.get(
  "/fetchOverdueTasks",
  authenticate,
  authorizeAdmin,
  addArrayForStaff("Tasks"),
  asyncHandler(taskInfoControllers.fetchOverdueTasks)
);

router.get(
  "/fetchParticularTask/:taskId",
  authenticate,
  authorizeAdmin,
  addArrayForStaff("Tasks"),
  asyncHandler(taskInfoControllers.fetchParticularTask)
);

// Fetch Helping Details
router.get(
  "/fetchAllLeads",
  authenticate,
  authorizeAdmin,
  addArrayForStaff("Leads"),
  asyncHandler(otherInfoControllers.getAllLeads)
);

router.get(
  "/fetchAllVisaApplications",
  authenticate,
  authorizeAdmin,
  // addArrayForStaff("VisaApplications"),
  asyncHandler(otherInfoControllers.getAllVisaApplications)
);

router.get(
  "/fetchAssigneeList",
  authenticate,
  authorizeAdmin,
  asyncHandler(otherInfoControllers.getAssigneeList)
);

// Remark
router.post(
  "/addRemark/:taskId",
  authenticate,
  authorizeAdmin,
  asyncHandler(otherInfoControllers.addRemark)
);

router.patch(
  "/editRemark/:taskId/:remarkId",
  authenticate,
  authorizeAdmin,
  asyncHandler(otherInfoControllers.editRemark)
);



export default router;
