import { Router } from "express";
import { authenticate } from "../../../middlewares/authenticate";
import asyncHandler from "../../../utils/asyncHandler";
import * as visaApplicationController from "../../../controllers/user/visaApplication"
// import { authenticate } from "../../../middlewares/authenticate";
// import asyncHandler from "../../../utils/asyncHandler";
// import * as visaApplicationController from "../../../controllers/user/visaApplication";


const router = Router();

router.route("/allVisaApplications").get(authenticate,asyncHandler(visaApplicationController.getAllApplications));
router.route("/previousapplication").get(authenticate,asyncHandler(visaApplicationController.getAllPreviousApplications));
router.route("/fetchOngoingVisapplications").get(authenticate,asyncHandler(visaApplicationController.fetchOngoingApplications));
// router.post("/create-visaApplication", authenticate, asyncHandler(visaApplicationController.createVisaApplication));
// router.post("/add-visaType-steps", authenticate, asyncHandler(visaTypeController.addStepToVisaType));
// router.post("/create-visaType-requirement", authenticate, asyncHandler(visaTypeController.createRequirementAndPushToVisaType));



export default router;

// POST ( visaApplication {visaId} )


// user -->>
// create visaApplication
// upload document (for a particalur requirement)
// reupload , preview
// download visa/document
//continue -->> (update the current step )
// trade name accept or send request to chane it
// select investment option
// get delivery details 

// GET All visaApplications
// GET onGoing visaApplications








// Admin -->>
// requirement -->> update stsus of a particular requiremnt (mark as verified , needs re-upload)
// Give reason
// step -->> appprove/reject
// update ststus of a step (like portugal step -4 {Application drafting is in progress })
// upload document
// create bank account
// create medical appointment for a visaApplication
// Add delivery details/ update satus of delivery
// 
