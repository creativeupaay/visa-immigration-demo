import express from "express";
import authRoutes from "./authRoutes";
import userRoutes from "./user/index";
import adminRoutes from "./admin/index";
import visaApplicationRoutes from "./visaApplication/index"
import publicRoutes from "./public/index";

const router = express.Router();

router.use("/auth",authRoutes)
router.use("/user", userRoutes);
router.use("/admin", adminRoutes);
router.use("/visaApplications" , visaApplicationRoutes);
router.use("/public", publicRoutes);


export default router;
