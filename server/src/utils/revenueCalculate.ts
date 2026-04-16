import { RevenueModel } from "../leadModels/revenueModel";
import { VisaTypeModel } from "../models/VisaType";
import { currencyConversion } from "../services/currencyConversion/currencyConversion";
import { VisaTypeEnum } from "../types/enums/enums";

export const updateRevenueSummary = async (
  visaTypeId: string,
  amount: number,
  currencyType: string
) => {
  try {
    console.log("Inside updateRevenueSummary", visaTypeId, amount, currencyType);

    const visaTypeInfo = await VisaTypeModel.findById(visaTypeId);
    if (!visaTypeInfo) {
      console.error("VisaType not found for ID:", visaTypeId);
      return;
    }

    const visaTypeName = visaTypeInfo.visaType as VisaTypeEnum;

    let amountInUSD = amount;
    if (currencyType !== "USD") {
      const normalizedCurrencyType = currencyType.trim().toUpperCase() 
      const converted = await currencyConversion(normalizedCurrencyType, "USD", amount);
      if (converted === null) {
        console.error("Currency conversion failed. Aborting revenue update.");
        return;
      }
      amountInUSD = converted;
    }

    console.log(`Updating revenue for: ${visaTypeName}, USD Amount: ${amountInUSD}`);

    await RevenueModel.findOneAndUpdate(
      { visaType: visaTypeName },
      { $inc: { totalRevenue: amountInUSD } },
      { upsert: true, new: true }
    );

    console.log("Revenue updated successfully");

  } catch (error) {
    console.error("Error updating revenue summary:", error);
  }
};


