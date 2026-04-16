import { ParsedGrenadaXXXData } from "../parsingFunctions/grenadaParse";
import { leadPriority } from "../types/enums/enums";

export const getGrenadaPriority = (data: ParsedGrenadaXXXData): leadPriority => {
  // Array to store individual scores (3 for HIGH, 2 for MEDIUM, 1 for LOW)
  const scores: number[] = [];

  // Check profession-specific criteria
  switch (data.profession) {
    case "Business Owner / Entrepreneur":
      // Question 1: Do you own a legally registered business?
      if (
        data.businessOwner.registeredBusiness ===
        "Yes, and it has consistent revenue"
      ) {
        scores.push(3); // HIGH
      } else if (
        data.businessOwner.registeredBusiness ===
        "Yes, but revenue is inconsistent"
      ) {
        scores.push(2); // MEDIUM
      } else if (
        data.businessOwner.registeredBusiness === "No, I do not own a business"
      ) {
        scores.push(1); // LOW
      }

      // Question 2: What's your estimated annual business revenue?
      if (data.businessOwner.annualRevenue === "$250,000+") {
        scores.push(3); // HIGH
      } else if (data.businessOwner.annualRevenue === "$100,000 – $250,000") {
        scores.push(2); // MEDIUM
      } else if (data.businessOwner.annualRevenue === "Less than $100,000") {
        scores.push(1); // LOW
      }

      // Question 3: Are you looking to invest in real estate or the government fund?
      if (
        data.businessOwner.investmentPreference ===
          "Yes, I prefer real estate" ||
        data.businessOwner.investmentPreference ===
          "Yes, I prefer the government donation"
      ) {
        scores.push(3); // HIGH
      } else if (
        data.businessOwner.investmentPreference ===
        "Not sure yet, I need more guidance"
      ) {
        scores.push(2); // MEDIUM
      } else {
        scores.push(1); // LOW (default for other responses)
      }
      break;

    case "Investor":
      // Question 1: Are you ready to invest the required amount?
      if (
        data.investor.readyToInvest ===
        "Yes, I have at least $150,000 available"
      ) {
        scores.push(3); // HIGH
      } else if (data.investor.readyToInvest === "I need financing options") {
        scores.push(2); // MEDIUM
      } else if (
        data.investor.readyToInvest === "No, I do not have the funds"
      ) {
        scores.push(1); // LOW
      }

      // Question 2: Which investment route are you considering?
      if (
        data.investor.investmentRoute ===
          "Government Fund Contribution ($100,000+)" ||
        data.investor.investmentRoute === "Real Estate Investment ($200,000+)"
      ) {
        scores.push(3); // HIGH
      } else if (
        data.investor.investmentRoute === "Not sure yet, exploring options"
      ) {
        scores.push(2); // MEDIUM
      } else {
        scores.push(1); // LOW (default for other responses)
      }
      break;

    case "High-Net-Worth Individual (HNWI)":
      // Question 1: What is the total value of your assets?
      if (data.HNWI.totalAssets === "$250,000+") {
        scores.push(3); // HIGH
      } else if (data.HNWI.totalAssets === "$150,000 – $250,000") {
        scores.push(2); // MEDIUM
      } else if (data.HNWI.totalAssets === "Less than $150,000") {
        scores.push(1); // LOW
      }

      // Question 2: Are you seeking citizenship for investment or personal relocation?
      if (
        data.HNWI.citizenshipReason === "Investment" ||
        data.HNWI.citizenshipReason === "Personal Relocation"
      ) {
        scores.push(3); // HIGH
      } else if (data.HNWI.citizenshipReason === "Not sure yet") {
        scores.push(2); // MEDIUM
      } else {
        scores.push(1); // LOW (default for other responses)
      }
      break;

    case "Employee / Professional":
      // Question 1: What is your monthly income?
      if (data.employee.monthlyIncome === "$10,000+/month") {
        scores.push(3); // HIGH
      } else if (data.employee.monthlyIncome === "$5,000 – $10,000") {
        scores.push(2); // MEDIUM
      } else if (data.employee.monthlyIncome === "Less than $5,000") {
        scores.push(1); // LOW
      }

      // Question 2: Do you have investment capital ready?
      if (
        data.employee.isInvestmentCapitalReady ===
        "Yes, I have at least $150,000"
      ) {
        scores.push(3); // HIGH
      } else if (
        data.employee.isInvestmentCapitalReady === "I need financing options"
      ) {
        scores.push(2); // MEDIUM
      } else if (
        data.employee.isInvestmentCapitalReady === "No, I do not have the funds"
      ) {
        scores.push(1); // LOW
      }
      break;

    case "Other":
      // For "Other" profession, requires manual review - default to MEDIUM
      scores.push(2); // MEDIUM
      break;
  }

  // General Eligibility Questions for all users

  // Question 1: What's your main goal?
  if (
    data.mainGoal ===
    "Securing second citizenship for travel/business opportunities"
  ) {
    scores.push(3); // HIGH
  } else if (data.mainGoal === "Exploring residency options instead") {
    scores.push(2); // MEDIUM
  } else {
    scores.push(1); // LOW (default for other responses)
  }

  // Question 2: What budget range are you considering?
  if (data.budgetRange === "$150,000+") {
    scores.push(3); // HIGH
  } else if (data.budgetRange === "$100,000– $150,000") {
    scores.push(2); // MEDIUM
  } else if (data.budgetRange === "Less than $100,000") {
    scores.push(1); // LOW
  }

  // Question 3: Are you planning to apply within the next 6–12 months?
  if (data.movingToApply === "Yes, I'm ready") {
    scores.push(3); // HIGH
  } else if (data.movingToApply === "I'm considering it and need more info") {
    scores.push(2); // MEDIUM
  } else if (data.movingToApply === "No, just exploring options") {
    scores.push(1); // LOW
  }

  // Question 4: Have you had any visa refusals or legal issues with immigration before?
  if (data.visaIssues === "No, my record is clear") {
    scores.push(3); // HIGH
  } else if (data.visaIssues === "Yes, but I can explain") {
    scores.push(2); // MEDIUM
  } else if (data.visaIssues === "Not sure") {
    scores.push(1); // LOW
  }

  // Calculate average score
  let totalScore = 0;
  let validResponses = 0;

  for (const score of scores) {
    totalScore += score;
    validResponses++;
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





