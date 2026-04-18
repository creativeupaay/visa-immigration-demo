import { Request, Response } from "express";
import mongoose from "mongoose";
import { LeadModel } from "../../leadModels/leadModel";
import { PaymentModel } from "../../leadModels/paymentModel";
import { UserModel } from "../../models/Users";
import { paymentStatus, PaymentSourceEnum, leadStatus, RoleEnum, AccountStatusEnum } from "../../types/enums/enums";
import { logPaymentDone } from "../../services/logs/triggers/leadLogs/payment/payment-done";
import { RoleModel } from "../../models/rbacModels/roleModel";
import { createVisaApplication } from "../Leads/paymentFunctions";
import { getServiceType } from "../../utils/leadToServiceType";
import bcrypt from "bcryptjs";
import { dubaiPaymentModel } from "../../extraModels/dubaiPayments";

const VISATYPE_MAP: Record<string, string> = {
  "Portugal": "6803644993e23a8417963622",
  "Dubai": "6803644993e23a8417963623",
  "Dominica": "6803644993e23a8417963620",
  "Grenada": "6803644993e23a8417963621",
};

const isDemoMode = () => {
  return (
    process.env.DEMO_MODE === "true" ||
    process.env.MOCK_PAYMENT_MODE === "true" ||
    process.env.NODE_ENV !== "production"
  );
};

export const mockProcessPayment = async (req: Request, res: Response) => {
  const { leadId, cardNumber, cardHolder } = req.body;

  try {
    // 1. Validate lead existence
    const lead = await LeadModel.findById(leadId);
    if (!lead) {
      res.status(404);
      throw new Error("Lead not found");
    }

    // 2. Find existing payment document
    const payment = await PaymentModel.findOne({ leadId });
    if (!payment) {
      res.status(404);
      throw new Error("No payment record found for this lead");
    }

    // 3. Update payment to PAID status
    payment.status = paymentStatus.PAID;
    payment.paymentIntentId = `mock_charge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    payment.paymentMethod = `Card ending in ${cardNumber.slice(-4)}`;
    await payment.save();

    // 4. Update lead status to PAYMENTDONE
    lead.leadStatus = leadStatus.PAYMENTDONE;
    await lead.save();

    // 5. Create client user from lead
    const demoPassword = isDemoMode() ? "Client@12345" : Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(demoPassword, 10);

    const customerRole = await RoleModel.findOne({ roleName: "Customer" });
    if (!customerRole) {
      res.status(500);
      throw new Error("Customer role not found");
    }

    const user = await UserModel.create({
      name: lead.fullName,
      email: lead.email,
      phone: lead.phone,
      nationality: lead.nationality,
      password: hashedPassword,
      role: RoleEnum.USER,
      status: AccountStatusEnum.ACTIVE,
      roleId: customerRole._id,
    });

    // 6. Create visa application automatically
    const visaType = lead.__t?.replace("Lead", "") || "Unknown";
    const visaTypeId = VISATYPE_MAP[visaType];

    const { visaApplicantInfo } = await createVisaApplication({
      leadId: lead._id as mongoose.Types.ObjectId,
      userId: user._id as mongoose.Types.ObjectId,
      visaTypeId,
      paymentId: payment._id as mongoose.Types.ObjectId,
    });

    // 7. Log payment completion with null checks
    if (payment.amount && payment.currency) {
      await logPaymentDone({
        leadName: lead.fullName,
        leadId: lead._id as mongoose.Types.ObjectId,
        amount: payment.amount,
        currency: payment.currency,
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment processed successfully. Client account and application created.",
      paymentId: payment._id,
      transactionId: payment.paymentIntentId,
      amount: payment.amount || 0,
      currency: payment.currency || "usd",
      cardLast4: cardNumber.slice(-4),
      // Return client credentials for demo
      ...(isDemoMode()
        ? {
            clientCreated: true,
            clientCredentials: {
              email: user.email,
              password: demoPassword,
              name: user.name,
              loginUrl: "/login",
            },
            visaApplication: {
              applicationId: visaApplicantInfo._id,
              caseId: visaApplicantInfo.nanoVisaApplicationId,
              status: visaApplicantInfo.status,
            },
          }
        : {}),
    });
  } catch (error) {
    res.status(500);
    throw error;
  }
};

export const mockProcessDubaiPayment = async (req: Request, res: Response) => {
  const { stepStatusId, cardNumber } = req.body;

  try {
    if (!stepStatusId) {
      res.status(400);
      throw new Error("stepStatusId is required");
    }

    const paymentDoc = await dubaiPaymentModel.findOne({ stepStatusId });
    if (!paymentDoc) {
      res.status(404);
      throw new Error("No Dubai payment record found for this step");
    }

    paymentDoc.status = paymentStatus.PAID;
    paymentDoc.paymentIntentId = `mock_dubai_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    paymentDoc.paymentMethod = `Card ending in ${String(cardNumber || "0000").slice(-4)}`;
    paymentDoc.invoiceUrl = paymentDoc.invoiceUrl || `https://dashboard.stripe.com/test/payments/${paymentDoc.paymentIntentId}`;
    await paymentDoc.save();

    res.status(200).json({
      success: true,
      message: "Dubai payment mocked successfully",
      transactionId: paymentDoc.paymentIntentId,
      amount: paymentDoc.amount,
      currency: paymentDoc.currency,
      invoiceUrl: paymentDoc.invoiceUrl,
    });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw error;
  }
};
