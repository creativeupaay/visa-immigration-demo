import { Router } from "express";
import visaApplicationRoutes from "./visaApplicationRoutes"

const router = Router();

// router.use("/", );
router.use("/visaapplication",visaApplicationRoutes)

export default router;