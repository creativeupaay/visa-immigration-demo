// import { Router } from "express";
// import { authenticate ,authorizeAdmin } from "../../../middlewares/authenticate";
// import asyncHandler from "../../../utils/asyncHandler";
// import * as jotformControllers from "../../../controllers/Leads/jotformController";
// import multer from "multer";

// const router = Router();

// const upload = multer({ storage: multer.memoryStorage() });

// router.post("/webhook/fetchJotformData", upload.any() , asyncHandler(jotformControllers.jotFormWebhook));
// export default router;