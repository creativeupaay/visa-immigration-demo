import { DgInvestmentModel } from "../../extraModels/dgInvestment";
import { DgBankDetailsModel } from "../../extraModels/dgBankDetails";
import {
  investmentOptionEnum,
  dgInvestStatusEnum,
} from "../../types/enums/enums";
import { Types } from "mongoose";

export const getDgInvestmentStepResponse = async ({
  stepStatusId,
}: {
  stepStatusId: Types.ObjectId;
}) => {
  const dgInvestment = await DgInvestmentModel.findOne({ stepStatusId });

  if (!dgInvestment) {
    return {
      statusCode: 200,
      message: "Investmetn option not selected yet.",
    };
  }

  const { investmentOption, dgInvestStatus, invoiceUrl, realStateOptions } =
    dgInvestment;

  // 11 & 12: EDF or NTF → fetch bankDetails + invoiceUrl
  if (
    investmentOption === investmentOptionEnum.EDF ||
    investmentOption === investmentOptionEnum.NTF
  ) {
    const visaTypeName =
      investmentOption === investmentOptionEnum.EDF ? "DOMINICA" : "GRENADA";
      
    const bankDetails = await DgBankDetailsModel.findOne({ visaTypeName });

    if (
      dgInvestStatus === dgInvestStatusEnum.optionSelected ||
      dgInvestStatus === dgInvestStatusEnum.paymentDone
    ) {
      return {
        statusCode: 200,
        message: "Investment info fetched successfully.",
        dgInvestmentData: {
          investInfo: {
            investmentOption,
            dgInvestStatus,
            invoiceUrl,
          },
          bankDetails,
        },
      };
    }
  }

  // REAL_STATE → include realStateOptions
  else if (investmentOption === investmentOptionEnum.REAL_STATE) {
    return {
      statusCode: 200,
      message: "Investment info fetched successfully.",
      dgInvestmentData: {
        investInfo: {
          investmentOption,
          status: dgInvestStatus,
          invoiceUrl,
          realStateOptions,
        },
      },
    };
  }

  // Fallback case
  return {
    statusCode: 400,
    message: "Invalid investment option or status.",
  };
};
