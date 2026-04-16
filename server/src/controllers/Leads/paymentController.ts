import { NextFunction, Request, Response } from "express";
import mongoose, { Schema, model, Document } from "mongoose";
import AppError from "../../utils/appError";
import {
  createPaymentLink,
  createPaymentSession,
} from "../../utils/paymentUtils";
import { LeadModel } from "../../leadModels/leadModel";
import { UserModel } from "../../models/Users";
import { PaymentModel } from "../../leadModels/paymentModel";
import { VisaApplicationModel } from "../../models/VisaApplication";
import axios from 'axios';
import { VisaStepModel as stepModel } from "../../models/VisaStep";
import { VisaApplicationStepStatusModel as stepStatusModel } from "../../models/VisaApplicationStepStatus";
import { VisaStepRequirementModel as reqModel } from "../../models/VisaStepRequirement";
import { VisaApplicationReqStatusModel as reqStatusModel } from "../../models/VisaApplicationReqStatus";

import {
  leadStatus,
  RoleEnum,
  AccountStatusEnum,
  VisaApplicationStatusEnum,
  StepStatusEnum,
  visaApplicationReqStatusEnum,
  paymentPurpose,
  PaymentSourceEnum,
} from "../../types/enums/enums";
import { paymentStatus } from "../../types/enums/enums";
import { sendEmail } from "../../utils/sendEmail";
import bcrypt from "bcryptjs";
import Stripe from "stripe";
import { stripe } from "../../utils/paymentUtils";
import { updateRevenueSummary } from "../../utils/revenueCalculate";
import { addToRecentUpdates } from "../../utils/addToRecentUpdates";
import { sendPaymentLinkToLead } from "../../services/emails/triggers/leads/payment/payment-link-send";
import { getServiceType } from "../../utils/leadToServiceType";
import { sendPortalAccessToClient } from "../../services/emails/triggers/leads/payment/payment-successful";
import { handleDubaiPayment } from "../visaApplications/DubaiControllers/paymentController";
// import functions
import { createUserFunction, createVisaApplication } from "./paymentFunctions";
import { PORTAL_LINK } from "../../config/configLinks";

import { logPaymentDone } from "../../services/logs/triggers/leadLogs/payment/payment-done";
import { logPaymentLinkSent } from "../../services/logs/triggers/leadLogs/payment/payment-link-sent";

// send payment link
export const sendPaymentLink = async (req: Request, res: Response) => {
  const leadId = req.params.leadId;
  const { amount, currency } = req.body;

  // 1. Validate lead existence
  const lead = await LeadModel.findById(leadId);
  if (!lead) {
    res.status(404);
    throw new Error("Lead not found");
  }

  // Check if assignedIds exist and leadId is not included
  if (Array.isArray(req.assignedIds) &&  !req.assignedIds.map((id) => id.toString()).includes(leadId)  ) {
    return res
      .status(403)
      .json({ message: "Your role does not have permission to do this action." });
  }

  const pageUrl = `${process.env.FRONTEND_URL}/payments/${lead._id}`;

  // const pageUrl = `${PORTAL_LINK}/payments/${lead._id}`

  //  send link to the customer / lead
  await sendPaymentLinkToLead(
    lead.email,
    lead.fullName?.split(" ")[0],
    getServiceType(lead.__t ?? ""),
    pageUrl
  );

  

  await logPaymentLinkSent({
    leadName : lead.fullName,
    adminName : req.admin?.userName ,
    leadId : lead._id as mongoose.Types.ObjectId,
    doneBy : req.admin?.userName 
  })

  // save payemnt details in DB
  const payment = new PaymentModel({
    leadId: lead._id,
    name: lead.fullName,
    email: lead.email,
    amount,
    currency,
    paymentLink: null, // yaha isko null rakh denge
    status: paymentStatus.LINKSENT,
    source: PaymentSourceEnum.STRIPE,
  });

  await payment.save();

  res.status(200).json({
    success: true,
    pageUrl,
    meassage: "payment link successfully sent ",
  });
  return;
};

export const proceedToPayment = async (req: Request, res: Response) => {
  const leadId = req.params.leadId;

  // 1. Validate lead existence
  const lead = await LeadModel.findById(leadId);
  if (!lead) {
    res.status(404);
    throw new Error("Lead not found");
    return;
  }

  // 2. Fetch existing payment document by leadId
  const paymentDoc = await PaymentModel.findOne({ leadId });
  if (!paymentDoc) {
    res.status(404);
    throw new Error("No payment record found for this lead");
    return;
  }

  const { amount, currency } = paymentDoc;
  if (!amount || !currency) {
    res.status(400);
    throw new Error("Amount or currency not set in payment document");
    return;
  }
  // prepare data and metaData (to send in cretaeSession function)
  const productName = `Visa Consultation for ${lead.fullName}`;
  const metadata = {
    leadId: lead._id?.toString(),
    email: lead.email,
    purpose: paymentPurpose.CONSULTATION,
  };

  const paymentUrl = await createPaymentSession(
    productName,
    metadata,
    amount,
    currency
  );

  paymentDoc.paymentLink = paymentUrl;
  await paymentDoc.save();

  res.status(200).json({ paymentUrl });
  return;
};

const VISATYPE_MAP: Record<string, string> = {
  Portugal: "6803644993e23a8417963622",
  Dubai: "6803644993e23a8417963623",
  Dominica: "6803644993e23a8417963620",
  Grenada: "6803644993e23a8417963621",
};

// stripe webhook
export const stripeWebhookHandler = async (req: Request, res: Response) => {
  console.log("Payment Webhook hit!");

  const sig = req.headers["stripe-signature"] as string;

  if (!sig) {
    console.error("Stripe signature missing in headers");
    res.sendStatus(400);
    return;
  }

  // Verify signature and construct event
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    console.log("Stripe event constructed successfully");
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    res.sendStatus(400);
    return;
  }

  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  console.log("paymentIntent kaaaaaa dataaaaaa:", paymentIntent);
  console.log("paymentIntent kaaaaaa dataaaaaa:", paymentIntent);


  console.log("Payment metadata:", paymentIntent.metadata);

  // Route to appropriate handler based on payment purpose
  const purpose = paymentIntent.metadata?.purpose;

  try {
    switch (purpose) {
      case paymentPurpose.CONSULTATION:
        await handleConsultationPayment(event, paymentIntent);
        break;
      case paymentPurpose.DUBAI_PAYMENT:
        await handleDubaiPayment(event, paymentIntent);
        break;
      default:
        console.error("Unknown payment purpose:", purpose);
        // Default to consultation payment for backward compatibility
        await handleConsultationPayment(event, paymentIntent);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Error processing payment:", error);
    // Still return 200 to prevent Stripe from retrying
    res.sendStatus(200);
  }
};

export const handleConsultationPayment = async (
  event: Stripe.Event,
  paymentIntent: Stripe.PaymentIntent
) => {
  const leadId = paymentIntent.metadata?.leadId;
  if (!leadId) {
    console.error("leadId missing in metadata");
    throw new Error("leadId missing in metadata");
  }
  console.log("leadId from metadata:", leadId);

  const lead = await LeadModel.findById(leadId);
  if (!lead) {
    console.error("Lead not found:", leadId);
    throw new Error("Lead not found");
  }
  console.log("Lead found:", lead);

  // Extract name to store in userDb
  const name = lead.fullName

  const payment = await PaymentModel.findOne({ leadId });
  if (payment) {
    // payment.amount = paymentIntent.amount_received / 100;
    // payment.currency = paymentIntent.currency;
    payment.paymentIntentId = paymentIntent.id;
    await payment.save();
  } else {
    console.warn("No existing payment record found for lead:", leadId);
  }

  // Handle different event types
  switch (event.type) {
    case "payment_intent.succeeded":
      await handleConsultationPaymentSuccess(
        paymentIntent,
        payment,
        lead,
        name
      );
      break;

    case "payment_intent.payment_failed":
      await handleConsultationPaymentFailure(payment);
      break;

    default:
      console.log("Ignored event type:", event.type);
  }
};

/**
 * Handles successful consultation payments
 */
const handleConsultationPaymentSuccess = async (
  paymentIntent: Stripe.PaymentIntent,
  payment: any | null,
  lead: any,
  name: string
) => {
  let invoiceUrl: string | null = null;
  let paymentMethod: string | null = null;

  console.log("we are in paymentSuccess Handler.........");
  console.log("we are in paymentSuccess Handler.........");

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

  // Update lead status and create user account
  if (lead) {
    lead.leadStatus = leadStatus.PAYMENTDONE;
    await lead.save();

    // log for payment done
    await logPaymentDone({
      leadName : lead.fullName,
      amount : payment.amount,
      currency : payment.currency,
      leadId : lead._id as mongoose.Types.ObjectId,
      doneBy : lead.fullName
    })

    // Extract phone number to store in userDb
    const phone = lead?.phone;
    const nationality = lead?.nationality;
    const fullName = lead.fullName;
    console.log(fullName);

    const user = await createUserFunction({
      name: fullName,
      email: lead?.email || "",
      phone: phone,
      nationality: nationality,
      serviceType: getServiceType(lead.__t || ""),
    });

    const visaType = lead.__t?.replace("Lead", "") || "Unknown";
    const visaTypeId = VISATYPE_MAP[visaType];

    const { visaApplicantInfo } = await createVisaApplication({
      leadId: lead._id as mongoose.Types.ObjectId,
      userId: user._id,
      visaTypeId: visaTypeId,
      paymentId: payment._id,
    });

    // Function call to add visapplication recent updates Db
    try {
      const _id = visaApplicantInfo._id;
      console.log("Attempting to add to recent updates with:", name);
      await addToRecentUpdates({
        caseId: _id.toString(),
        status: "Processing",
        name,
      });
      console.log("Added to recent updates");
    } catch (error) {
      console.error("Failed to add to recent updates:", error);
    }

    // Function to update the revenue of particular visaType for dashboard analytics
    try {
      console.log(
        "Attempting to update revenue summary with:",
        visaTypeId,
        paymentIntent.amount_received / 100
      );
      await updateRevenueSummary(
        visaTypeId,
        paymentIntent.amount_received / 100,
        paymentIntent.currency
      );
      console.log("Added to revenue updates");
    } catch (error) {
      console.error("Failed to update revenue summary:", error);
    }
  }
};

/**
 * Handles failed consultation payments
 */
const handleConsultationPaymentFailure = async (payment: any | null) => {
  if (payment) {
    payment.status = paymentStatus.FAILED;
    payment.invoiceUrl = null;
    payment.paymentMethod = null;
    await payment.save();
  }
};

// consultation   -->>  Admin clike kare and link( website page ka link ) mail ho jaye user ko
//                      proceed to payment per api call -->> create payment session , and all




export const viewInvoice = async (req: Request, res: Response) => {
  const { paymentId } = req.params;
  // console.log(`This is our paymentId in viewInvoice controller :` , paymentId );
  if (!mongoose.Types.ObjectId.isValid(paymentId)) {
    return res.status(400).json({ message: "Invalid payment ID" });
  }

  // 1. Find payment from DB
  const payment = await PaymentModel.findById(paymentId);
  // console.log({ payment });
  if (!payment) {
    return res.status(404).json({ message: "Payment not found" });
  }

  let { invoiceUrl, paymentIntentId } = payment;
  let isExpired = false;

  // 2. Check if stored invoiceUrl exists
  if (invoiceUrl) {
    try {
      const response = await axios.head(invoiceUrl, {
        maxRedirects: 0,
        validateStatus: null,
      });

      // console.log(`this is our response : ` , response );

      // 3. Detect if it's expired based on response
      if (
        [302, 403, 410].includes(response.status) ||
        response.headers.location?.includes("expired")
      ) {
        // console.log(`this is response status : ` , response.status );
        isExpired = true;
      }
    }
    catch (err) {
      isExpired = true; // network failure = treat as expired
    }
  }
  else{
    isExpired = true;
  }

  // 4. If expired or missing, fetch fresh receipt_url from Stripe
  if (isExpired) {
    if (!paymentIntentId) {
      return res.status(400).json({ message: "No paymentIntentId found to regenerate invoice" });
    }
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    // console.log(`this is our paymentIntent in viewInvoice controller :` , paymentIntent);
    if (!paymentIntent.latest_charge) {
      return res.status(400).json({ message: "No latest charge found for this paymentIntent" });
    }

    const charge = await stripe.charges.retrieve(paymentIntent.latest_charge as string);
    // console.log(`this is our charge in viewInvoice controller :` , charge);
    const freshUrl = charge.receipt_url ?? null;
    // console.log(`this is our freshUrl in viewInvoice controller :` , freshUrl);

    if (!freshUrl) {
      return res.status(500).json({ message: "Unable to retrieve fresh receipt URL from Stripe" });
    }

    // 5. Update in DB
    payment.invoiceUrl = freshUrl;
    await payment.save();

    return res.status(200).json({ invoiceUrl: freshUrl });
  }

  // 6. If not expired, return old one
  // console.log( `there was no need to reGenerate , not expoired: ` ,invoiceUrl );
  return res.status(200).json({ invoiceUrl });
};