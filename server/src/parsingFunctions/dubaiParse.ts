type RawDubaiData = {
  q1_fullName?: { first?: string; last?: string };
  q4_nationality?: string;
  q6_email?: string;
  q61_fullPhone?: string;
  q42_whichBest42?: string;
  q62_whatsYour62?: string[];
  q52_whatBudget?: string;
  q54_areYou54?: string;
  q55_haveYou55?: string;
  q38_anythingElse?: string;
  slug?: string;
  q60_pleaseSpecify60?: string;
  q47_whatIs47?: string;
  q57_areYou57?: string;
  q56_whatsYour?: string;
  q59_pleaseSpecify?: string;
  q58_areYou58?: string;
  q9_whichBest9?: string;
  q50_whatIs?: string;
};

export type ParsedDubaiData = {
  formId: string;
  fullName: string;
  nationality: string;
  email: string;
  phone: string;
  profession: string;
  mainGoal: string[];
  budgetRange: string;
  movingToDubai: string;
  visaIssues: string;
  extraInfo: string;

  businessOwner: {
    registeredBusiness: string | null;
    annualRevenue: string | null;
    relocationPlan: string | null;
  };
  freelancer: {
    incomeSource: string | null;
    monthlyIncome: string | null;
    requriedLicenseType: string | null;
  };
  employee: {
    transitionPlan: string | null;
    investmentCapital: string | null;
  };
  investor: {
    investmentAmount: string | null;
    industryInterest: string | null;
    targetedIndustry: string | null;
  };
  other: {
    otherProfessionDetail: string | null;
  };
};

export function parseDubaiData(rawData: RawDubaiData): ParsedDubaiData {
  const profession = rawData?.q42_whichBest42 || "";

  const parsedData: ParsedDubaiData = {
    formId: rawData?.slug?.split("/")?.[1] || "",

    fullName: `${rawData?.q1_fullName?.first || ""} ${rawData?.q1_fullName?.last || ""}`,
    nationality: rawData?.q4_nationality || "",
    email: rawData?.q6_email || "",
    phone: rawData?.q61_fullPhone || "",
    profession,
    mainGoal: rawData?.q62_whatsYour62 || [],
    budgetRange: rawData?.q52_whatBudget || "",
    movingToDubai: rawData?.q54_areYou54 || "",
    visaIssues: rawData?.q55_haveYou55 || "",
    extraInfo: rawData?.q38_anythingElse || "",

    // saari optional fields me \initailly null daal do
    businessOwner: {
      registeredBusiness: null,
      annualRevenue: null,
      relocationPlan: null,
    },
    freelancer: {
      incomeSource: null,
      monthlyIncome: null,
      requriedLicenseType: null,
    },
    employee: {
      transitionPlan: null,
      investmentCapital: null,
    },
    investor: {
      investmentAmount: null,
      industryInterest: null,
      targetedIndustry: null,
    },
    other: {
      otherProfessionDetail: null,
    },
  };

  // Populate respective field based on profession
  switch (profession) {
    case "Business Owner / Entrepreneur":
      parsedData.businessOwner = {
        registeredBusiness: rawData?.q60_pleaseSpecify60 || null,
        annualRevenue: rawData?.q47_whatIs47 || null,
        relocationPlan: rawData?.q57_areYou57 || null,
      };
      break;

    case "Freelancer / Remote Worker":
      parsedData.freelancer = {
        incomeSource: rawData?.q56_whatsYour || null,
        monthlyIncome: rawData?.q47_whatIs47 || null,
        requriedLicenseType: rawData?.q57_areYou57 || null,
      };
      break;

    case "Employee / Professional":
      parsedData.employee = {
        transitionPlan: rawData?.q59_pleaseSpecify || null,
        investmentCapital: rawData?.q57_areYou57 || null,
      };
      break;

    case "Investor":
      const industryInterest = rawData?.q58_areYou58 || null;
      parsedData.investor = {
        investmentAmount: rawData?.q50_whatIs || null,
        industryInterest,
        targetedIndustry:
          industryInterest === "Yes, I have a targeted industry"
            ? rawData?.q9_whichBest9 || null
            : null,
      };
      break;

    case "Other (please specify)":
      parsedData.other = {
        otherProfessionDetail: rawData?.q60_pleaseSpecify60 || null,
      };
      break;
  }

  return parsedData;
}
