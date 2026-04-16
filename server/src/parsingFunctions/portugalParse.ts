type RawPortugalData = {
  q1_fullName?: { first?: string; last?: string };
  q4_nationality?: string;
  dropdown_search?: string;
  q6_email?: string;
  q71_fullPhone?: string;
  q42_whichBest42?: string;
  q50_areYou50?: string;
  q58_doYou58?: string;
  q59_pleaseSpecify?: string;
  q63_whatKind?: string[];
  q53_whatIs53?: string;
  q65_canYou?: string;
  q66_doYou?: string;
  q67_areYou?: string;
  q68_doYou68?: string;
  q69_willYou?: string;
  q70_howMany?: string;
  q64_howMany64?: string;
  q38_anythingElse?: string;
  q47_areYou47?: string;
  q56_whatIs?: string;
  event_id?: string;
  // timeToSubmit?: number;
};

export type ParsedPortugalData = {
  formId: string;
  fullName:string;
  nationality: string;
  email: string;
  phone: string;
  profession: string;

  businessOwner: {
    annualRevenue: string | null;
    isOneLakhInvestmentAvailable: string | null;
  };

  remoteWorker: {
    monthlyIncomeFromRemoteWork: string | null;
    isSavingsInvestmentAvailable: string | null;
  };

  investor: {
    investmentAmount: string | null;
    industryInterest: string | null;
    targetedIndustry: string | null;
  };

  incomeSources: string[];
  monthlyIncomeRange: string;
  financialStatements: string;
  sufficientSavingsFor12Months: string;

  legalResidency: string;
  otherCitizenship: string;

  housingPlan: string;
  stayDuration: string;
  dependents: string;

  extraInfo: string;

  event_id: string;
  // timeToSubmit: number;
};

export const parsePortugalData = (
  rawData: RawPortugalData
): ParsedPortugalData => {
  const profession = rawData?.q42_whichBest42 || "";
  const formId = rawData?.event_id?.split("_")[1] || "";

  const parsedData: ParsedPortugalData = {
    formId,
    fullName: `${rawData?.q1_fullName?.first || ""} ${rawData?.q1_fullName?.last || ""}`,
    nationality: rawData?.q4_nationality || rawData?.dropdown_search || "",
    email: rawData?.q6_email || "",
    phone: rawData?.q71_fullPhone || "",
    profession,

    // Saari optional fields me initially null rakh do ...
    businessOwner: {
      annualRevenue: null,
      isOneLakhInvestmentAvailable: null,
    },
    remoteWorker: {
      monthlyIncomeFromRemoteWork: null,
      isSavingsInvestmentAvailable: null,
    },
    investor: {
      investmentAmount: null,
      industryInterest: null,
      targetedIndustry: null,
    },

    incomeSources: rawData?.q63_whatKind || [],
    monthlyIncomeRange: rawData?.q53_whatIs53 || "",
    financialStatements: rawData?.q65_canYou || "",
    sufficientSavingsFor12Months: rawData?.q66_doYou || "",

    legalResidency: rawData?.q67_areYou || "",
    otherCitizenship: rawData?.q68_doYou68 || "",

    housingPlan: rawData?.q69_willYou || "",
    stayDuration: rawData?.q70_howMany || "",
    dependents: rawData?.q64_howMany64 || "",

    extraInfo: rawData?.q38_anythingElse || "",

    event_id: rawData?.event_id || "",
    // timeToSubmit: rawData?.timeToSubmit || 0
  };

  // Populate profession-specific fields
  switch (profession) {
    case "Business Owner":
      parsedData.businessOwner = {
        annualRevenue: rawData?.q50_areYou50 || null,
        isOneLakhInvestmentAvailable: rawData?.q58_doYou58 || null,
      };
      break;

    case "Remote Worker":
      parsedData.remoteWorker = {
        monthlyIncomeFromRemoteWork: rawData?.q50_areYou50 || null,
        isSavingsInvestmentAvailable: rawData?.q58_doYou58 || null,
      };
      break;

    case "Investor":
      const industryInterest = rawData?.q47_areYou47 || null;
      parsedData.investor = {
        investmentAmount: rawData?.q56_whatIs || null,
        industryInterest,
        targetedIndustry:
          industryInterest === "Yes, I have a targeted industry"
            ? rawData?.q59_pleaseSpecify || null
            : null,
      };
      break;
  }

  return parsedData;
};
