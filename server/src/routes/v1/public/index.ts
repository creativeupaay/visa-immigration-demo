import express from "express";
import leadPublicRoutes from "./leadPublicRoutes";
import mockCalendlyRoutes from "./mockCalendlyRoutes";
import mockPaymentRoutes from "./mockPaymentRoutes";

const router = express.Router();

router.use("/leads", leadPublicRoutes);
router.use("/mock-calendly", mockCalendlyRoutes);
router.use("/mock-payment", mockPaymentRoutes);

export default router;
