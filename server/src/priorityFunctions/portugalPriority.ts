import { ParsedPortugalData } from "../parsingFunctions/portugalParse";
import { leadPriority } from "../types/enums/enums";

export const getPortugalPriority = (data: ParsedPortugalData): leadPriority => {
  // Array to store individual scores (3 for HIGH, 2 for MEDIUM, 1 for LOW)
  const scores: number[] = [];

  // 1. Income Sources - Any of the listed sources is eligible
  if (data.incomeSources && data.incomeSources.length > 0) {
    scores.push(3); // HIGH - Any of the above, as long as income meets the threshold
  } else {
    scores.push(1); // LOW - No stable income
  }

  // 2. Monthly Income Range
  if (data.monthlyIncomeRange) {
    if (
      data.monthlyIncomeRange.includes("€1,000 – €2,000") ||
      data.monthlyIncomeRange.includes("€2,000 – €4,000") ||
      data.monthlyIncomeRange.includes("Above €4,000")
    ) {
      scores.push(3); // HIGH - €1,000+ per month
    } else if (data.monthlyIncomeRange.includes("€500 – €1,000")) {
      scores.push(2); // MEDIUM - €500-€1,000 (may qualify with savings)
    } else {
      scores.push(1); // LOW - Below €500
    }
  }

  // 3. Financial Statements
  if (data.financialStatements) {
    if (
      data.financialStatements.includes("Yes") &&
      !data.financialStatements.toLowerCase().includes("incomplete")
    ) {
      scores.push(3); // HIGH - Yes, complete records
    } else if (
      data.financialStatements.includes("Yes") &&
      data.financialStatements.toLowerCase().includes("incomplete")
    ) {
      scores.push(2); // MEDIUM - Yes, but incomplete records
    } else {
      scores.push(1); // LOW - No documentation
    }
  }

  // 4. Sufficient Savings
  if (data.sufficientSavingsFor12Months) {
    if (
      data.sufficientSavingsFor12Months.includes("Yes") &&
      data.sufficientSavingsFor12Months.includes("€10,000")
    ) {
      scores.push(3); // HIGH - Yes, at least €10,000+ in savings
    } else if (
      data.sufficientSavingsFor12Months.includes("Yes") &&
      !data.sufficientSavingsFor12Months.includes("€10,000")
    ) {
      scores.push(2); // MEDIUM - Less than €10,000
    } else {
      scores.push(1); // LOW - No savings
    }
  }

  // 5. Legal Residency
  if (data.legalResidency) {
    if (
      data.legalResidency.includes("Yes") &&
      data.legalResidency.toLowerCase().includes("legal")
    ) {
      scores.push(3); // HIGH - Yes, legally documented
    } else if (data.legalResidency.includes("Yes")) {
      scores.push(2); // MEDIUM - Yes, but status is unclear
    } else {
      scores.push(1); // LOW - No legal residency anywhere
    }
  }

  // 6. Other Citizenship
  if (data.otherCitizenship) {
    if (
      data.otherCitizenship.includes("Yes") &&
      (data.otherCitizenship.toLowerCase().includes("eu") ||
        data.otherCitizenship.toLowerCase().includes("visa-friendly"))
    ) {
      scores.push(3); // HIGH - Yes, EU or visa-friendly passport
    } else if (data.otherCitizenship.includes("Yes")) {
      scores.push(2); // MEDIUM - Yes, but with travel restrictions
    } else {
      scores.push(1); // LOW - No second passport & restricted mobility
    }
  }

  // 7. Housing Plan
  if (data.housingPlan) {
    if (
      data.housingPlan.includes("rent") ||
      data.housingPlan.includes("purchase") ||
      data.housingPlan.toLowerCase().includes("buy")
    ) {
      scores.push(3); // HIGH - Yes, planning to rent or buy
    } else if (
      data.housingPlan.toLowerCase().includes("undecided") ||
      data.housingPlan.toLowerCase().includes("open")
    ) {
      scores.push(2); // MEDIUM - Undecided but open to it
    } else {
      scores.push(1); // LOW - No plans for housing
    }
  }

  // 8. Stay Duration
  if (data.stayDuration) {
    if (
      data.stayDuration.includes("183") ||
      data.stayDuration.toLowerCase().includes("more than 183")
    ) {
      scores.push(3); // HIGH - More than 183 days per year
    } else if (data.stayDuration.toLowerCase().includes("less than 183")) {
      scores.push(2); // MEDIUM - Less than 183 days per year
    } else {
      scores.push(1); // LOW - No long-term residency plans
    }
  }

  // 9. Profession-specific criteria
  switch (data.profession) {
    case "Business Owner":
      if (
        data.businessOwner.annualRevenue &&
        parseFloat(data.businessOwner.annualRevenue) > 50000
      ) {
        scores.push(3); // HIGH
      } else if (data.businessOwner.annualRevenue) {
        scores.push(2); // MEDIUM
      }

      if (data.businessOwner.isOneLakhInvestmentAvailable === "Yes") {
        scores.push(3); // HIGH
      } else if (data.businessOwner.isOneLakhInvestmentAvailable === "Maybe") {
        scores.push(2); // MEDIUM
      } else {
        scores.push(1); // LOW
      }
      break;

    case "Remote Worker":
      if (
        data.remoteWorker.monthlyIncomeFromRemoteWork &&
        parseFloat(data.remoteWorker.monthlyIncomeFromRemoteWork) >= 1000
      ) {
        scores.push(3); // HIGH
      } else if (
        data.remoteWorker.monthlyIncomeFromRemoteWork &&
        parseFloat(data.remoteWorker.monthlyIncomeFromRemoteWork) >= 500
      ) {
        scores.push(2); // MEDIUM
      } else {
        scores.push(1); // LOW
      }

      if (data.remoteWorker.isSavingsInvestmentAvailable === "Yes") {
        scores.push(3); // HIGH
      } else if (data.remoteWorker.isSavingsInvestmentAvailable === "Maybe") {
        scores.push(2); // MEDIUM
      } else {
        scores.push(1); // LOW
      }
      break;

    case "Investor":
      if (
        data.investor.investmentAmount &&
        parseFloat(data.investor.investmentAmount) >= 200000
      ) {
        scores.push(3); // HIGH
      } else if (
        data.investor.investmentAmount &&
        parseFloat(data.investor.investmentAmount) >= 50000
      ) {
        scores.push(2); // MEDIUM
      } else {
        scores.push(1); // LOW
      }

      if (
        data.investor.industryInterest === "Yes, I have a targeted industry"
      ) {
        scores.push(3); // HIGH
      } else if (
        data.investor.industryInterest === "No, I am open to options"
      ) {
        scores.push(2); // MEDIUM
      } else {
        scores.push(1); // LOW
      }
      break;
  }

  // 10. Dependents
  if (data.dependents) {
    const dependentCount = parseInt(data.dependents);
    if (!isNaN(dependentCount)) {
      if (dependentCount >= 0 && dependentCount <= 4) {
        scores.push(3); // HIGH - 1-4 dependents with financial means
      } else if (dependentCount > 4) {
        scores.push(2); // MEDIUM - 5+ dependents
      }
    } else {
      // If not numeric, try to interpret the response
      if (
        data.dependents.toLowerCase().includes("none") ||
        data.dependents.toLowerCase().includes("0")
      ) {
        scores.push(3); // HIGH - No dependents to support
      } else if (
        data.dependents.toLowerCase().includes("many") ||
        data.dependents.toLowerCase().includes("several")
      ) {
        scores.push(2); // MEDIUM - Many dependents
      } else {
        scores.push(1); // LOW - Default if can't interpret
      }
    }
  }

  // Calculate average score
  let totalScore = 0;
  let validResponses = scores.length;

  for (const score of scores) {
    totalScore += score;
  }

  const averageScore = validResponses > 0 ? totalScore / validResponses : 0;

  // Determine priority based on average score
  if (averageScore > 2.5) {
    return leadPriority.HIGH;
  } else if (averageScore >= 1.5) {
    return leadPriority.MEDIUM;
  } else {
    return leadPriority.LOW;
  }
};
