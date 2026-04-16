import { NextFunction, Request, Response } from "express";
import AppError from "../../../utils/appError";
import { dubaiPaymentModel } from "../../../extraModels/dubaiPayments";
import { createPaymentSession, stripe } from "../../../utils/paymentUtils";
import { paymentPurpose, paymentStatus, StepStatusEnum } from "../../../types/enums/enums";
import Stripe from "stripe";
import { VisaApplicationStepStatusModel } from "../../../models/VisaApplicationStepStatus";
import mongoose from "mongoose";
import { sendApplicationUpdateEmails } from "../../../services/emails/triggers/applicationTriggerSegregate/applicationTriggerSegregate";
import { createLogForVisaApplication } from "../../../services/logs/triggers/visaApplications/createLogForVisaApplication";


// For Admin
export const handleSendPaymentLink = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { stepStatusId } = req.params;
  const { amount, currency } = req.body;

  console.log("amount", amount);
  console.log("currency", currency);
  if (!stepStatusId) {
    return next(new AppError("stepStatusId is required", 400));
  }

  const paymentDocument = await dubaiPaymentModel.findOne({ stepStatusId });

  if (paymentDocument) {
    paymentDocument.paymentLink = null; 
    paymentDocument.amount = amount;
    paymentDocument.currency = currency;
    paymentDocument.status = paymentStatus.LINKSENT;
    await paymentDocument.save();
  } else {
    const newPaymentDocument = new dubaiPaymentModel({
      stepStatusId,
      amount,
      currency,
      status: paymentStatus.LINKSENT,
    });
    await newPaymentDocument.save();
  }

  res.status(200).json({
    status: "success",
    message: "Payment link sent successfully",
    paymentDocument
  });
  return;
};


// For User
export const proceedToPayment = async (req: Request, res: Response) => {
  const {stepStatusId} = req.params;

   // 1. Validate lead existence
   const paymentDoc = await dubaiPaymentModel.findOne({stepStatusId});

  if (!paymentDoc) {
    res.status(404);
    throw new Error("No payment record found for this stepStatusId");
    return;
  }

  const { amount, currency } = paymentDoc;
  if (!amount || !currency) {
    res.status(400);
    throw new Error("Amount or currency not set in payment document");
    return;
  }

  // prepare data and metaData (to send in cretaeSession function)
  const paymentLink = await createPaymentSession(
    "Dubai Business Setup Payment",
    { stepStatusId, purpose: paymentPurpose.DUBAI_PAYMENT },  // this is meta-data
    amount,
    currency , 
  );

  paymentDoc.paymentLink = paymentLink;
  await paymentDoc.save();

  res.status(200).json({ paymentLink });
  return;

};


// For Common
export const getPaymentStepInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { stepStatusId } = req.params;
  if (!stepStatusId) {
    return next(new AppError("stepStatusId is required", 400));
  }

  const paymentDocument = await dubaiPaymentModel.findOne({ stepStatusId });

  if (!paymentDocument) {
    return res.status(200).json({
      message: "Payment Link Not sent yet",
      data: null,
    });
  }

  const paymentDetails = {
    amount: paymentDocument.amount,
    currency: paymentDocument.currency,
    status: paymentDocument.status,
    paymentLink: paymentDocument.paymentLink,
    invoiceUrl: paymentDocument.invoiceUrl,
  };

  return res.status(200).json({
    status: "success",
    message: "Payment details fetched successfully",
    data: paymentDetails,
  });
};




export const handleDubaiPayment = async (
  event: Stripe.Event,
  paymentIntent: Stripe.PaymentIntent
) => {
  const stepStatusId = paymentIntent.metadata?.stepStatusId;
  if (!stepStatusId) {
    console.error("stepStatusId missing in metadata");
    throw new Error("stepStatusId missing in metadata");
  }
  console.log("stepStatusId from metadata:", stepStatusId);

  // Find the Dubai payment record
  const payment = await dubaiPaymentModel.findOne({ stepStatusId });
  if (payment) {
    payment.amount = paymentIntent.amount_received / 100;
    payment.currency = paymentIntent.currency;
    payment.paymentIntentId = paymentIntent.id;
    await payment.save();
  } else {
    console.warn(
      "No existing payment record found for stepStatus:",
      stepStatusId
    );
  }

  // Handle different event types
  switch (event.type) {
    case "payment_intent.succeeded":
      await handleDubaiPaymentSuccess(paymentIntent, payment, stepStatusId);
      break;

    case "payment_intent.payment_failed":
      await handleDubaiPaymentFailure(payment);
      break;

    default:
      console.log("Ignored event type:", event.type);
  }
};

/**
 * Handles successful Dubai payments
 */
const handleDubaiPaymentSuccess = async (
  paymentIntent: Stripe.PaymentIntent,
  payment: any | null,
  stepStatusId: string
) => {
  let invoiceUrl: string | null = null;
  let paymentMethod: string | null = null;

  if (paymentIntent.latest_charge) {
    try {
      const charge = await stripe.charges.retrieve(
        paymentIntent.latest_charge as string
      );
      invoiceUrl = charge.receipt_url ?? null;
      paymentMethod = charge.payment_method_details?.type ?? null;
    } catch (err) {
      console.error("Failed to retrieve charge:", err);
    }
  }

  if (payment) {
    payment.status = paymentStatus.PAID;
    payment.invoiceUrl = invoiceUrl;
    payment.paymentMethod = paymentMethod;
    await payment.save();
  }

  // Update step status or perform other Dubai payment-specific operations
  try {
    const aggregationResult = await VisaApplicationStepStatusModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(stepStatusId) } },
      {
        $lookup: {
          from: "visasteps",
          localField: "visaStepId",
          foreignField: "_id",
          as: "visaStep",
        },
      },
      { $unwind: "$visaStep" },
      {
        $lookup: {
          from: "visatypes",
          localField: "visaTypeId",
          foreignField: "_id",
          as: "visaType",
        },
      },
      { $unwind: "$visaType" },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          visaApplicationId: 1,
          visaStepId: 1,
          visaTypeId: 1,
          userId: 1,
          "visaStep.emailTriggers": 1,
          "visaStep.logTriggers": 1,
          "visaStep.stepName": 1,
          "visaType.visaType": 1,
          "user.email": 1,
          "user.name": 1,
        },
      },
    ]).exec();

    if (!aggregationResult.length) {
      console.error("Required data not found for stepStatusId:", stepStatusId);
      throw new Error(
        "Required data not found for stepStatusId:" + stepStatusId
      );
    }

    await sendApplicationUpdateEmails({
      triggers: aggregationResult[0].visaStep.emailTriggers,
      stepStatus: StepStatusEnum.SUBMITTED,
      visaType: aggregationResult[0].visaType.visaType,
      email: aggregationResult[0].user.email,
      firstName: aggregationResult[0].user.name,
    })

    // log creation
    await createLogForVisaApplication({
      triggers : aggregationResult[0].visaStep.logTriggers,
      clientName : aggregationResult[0].user.name,
      visaType : aggregationResult[0].visaType.visaType,
      stepName : aggregationResult[0].visaStep.stepName,
      stepStatus : StepStatusEnum.SUBMITTED, 
      doneBy : aggregationResult[0].user.name , 
      visaApplicationId : aggregationResult[0].visaApplicationId,
    })

    console.log("Dubai payment step completed for stepStatusId:", stepStatusId);
  } catch (error) {
    console.error("Error updating step status after payment:", error);
  }
};

/**
 * Handles failed Dubai payments
 */
const handleDubaiPaymentFailure = async (payment: any | null) => {
  if (payment) {
    payment.status = paymentStatus.FAILED;
    payment.invoiceUrl = null;
    payment.paymentMethod = null;
    await payment.save();
  }
};



// consultation   -->>  Admin clike kare and link( website page ka link ) email ho jaye user ko 
//                      proceed to payment per api call -->> create payment session , and all 

// dubai payment -->> user already ussi page per hai , toh proceed to payment per (ek api call ayegi ) 