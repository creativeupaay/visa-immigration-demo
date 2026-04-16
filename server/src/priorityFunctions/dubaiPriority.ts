import { ParsedDubaiData } from "../parsingFunctions/dubaiParse";
import { leadPriority } from "../types/enums/enums";

export const getDubaiPriority = (data: ParsedDubaiData): leadPriority => {
  // Array to store individual scores (3 for HIGH, 2 for MEDIUM, 1 for LOW)
  const scores: number[] = [];

  // Check profession-specific criteria
  switch (data.profession) {
    case "Business Owner / Entrepreneur":
      // Question 1: Do you currently own a registered business?
      if (
        data.businessOwner.registeredBusiness ===
        "Yes, my business is legally registered"
      ) {
        scores.push(3); // HIGH
      } else if (
        data.businessOwner.registeredBusiness ===
        "No, but I've operated informally"
      ) {
        scores.push(2); // MEDIUM
      } else if (
        data.businessOwner.registeredBusiness ===
        "No, I'm planning to start fresh"
      ) {
        scores.push(1); // LOW
      }

      // Question 2: What's your company's estimated annual revenue?
      if (
        data.businessOwner.annualRevenue === "$500,000+" ||
        data.businessOwner.annualRevenue === "$200,000 – $500,000" ||
        data.businessOwner.annualRevenue === "$50,000 – $200,000"
      ) {
        scores.push(3); // HIGH
      } else if (data.businessOwner.annualRevenue === "Less than $50,000") {
        scores.push(2); // MEDIUM
      } else if (data.businessOwner.annualRevenue === "No revenue yet") {
        scores.push(1); // LOW
      }

      // Question 3: Do you plan to relocate to Dubai or manage your business remotely?
      if (
        data.businessOwner.relocationPlan === "Yes, I plan to relocate" ||
        data.businessOwner.relocationPlan === "No, I will manage it remotely"
      ) {
        scores.push(3); // HIGH
      } else if (data.businessOwner.relocationPlan === "Not sure") {
        scores.push(2); // MEDIUM
      } else {
        scores.push(1); // LOW (default for other responses)
      }
      break;

    case "Freelancer / Remote Worker":
      // Question 1: What's your primary source of income?
      if (
        data.freelancer.incomeSource ===
        "Contract-based work with international clients"
      ) {
        scores.push(3); // HIGH
      } else if (
        data.freelancer.incomeSource === "Independent freelance projects" ||
        data.freelancer.incomeSource === "Full-time remote job"
      ) {
        scores.push(2); // MEDIUM
      } else if (data.freelancer.incomeSource === "No stable income") {
        scores.push(1); // LOW
      }

      // Question 2: What is your estimated monthly income?
      if (
        data.freelancer.monthlyIncome === "$10,000+" ||
        data.freelancer.monthlyIncome === "$5,000 – $10,000" ||
        data.freelancer.monthlyIncome === "$2,500 – $5,000"
      ) {
        scores.push(3); // HIGH
      } else if (data.freelancer.monthlyIncome === "Less than $2,500") {
        scores.push(2); // MEDIUM
      } else if (data.freelancer.monthlyIncome === "No steady income") {
        scores.push(1); // LOW
      }

      // Question 3: Are you looking for a freelance permit or a full business license?
      if (
        data.freelancer.requriedLicenseType === "Freelance Permit" ||
        data.freelancer.requriedLicenseType === "Full Business License"
      ) {
        scores.push(3); // HIGH
      } else if (data.freelancer.requriedLicenseType === "Not sure yet") {
        scores.push(2); // MEDIUM
      } else {
        scores.push(1); // LOW (default for other responses)
      }
      break;

    case "Employee / Professional":
      // Question 1: Are you looking to start a side business or fully transition?
      if (
        data.employee.transitionPlan === "Full transition to self-employment"
      ) {
        scores.push(3); // HIGH
      } else if (
        data.employee.transitionPlan === "Side business alongside my job"
      ) {
        scores.push(2); // MEDIUM
      } else {
        scores.push(1); // LOW (default for other responses)
      }

      // Question 2: Do you have investment capital to register a business?
      if (
        data.employee.investmentCapital ===
          "Yes, I have at least $5,000 – $10,000" ||
        data.employee.investmentCapital === "Yes, I have more than $10,000"
      ) {
        scores.push(3); // HIGH
      } else if (
        data.employee.investmentCapital === "No, I need financing options"
      ) {
        scores.push(1); // LOW
      } else {
        scores.push(2); // MEDIUM (default for other responses)
      }
      break;

    case "Investor":
      // Question 1: What is your preferred investment amount?
      if (
        data.investor.investmentAmount === "$250,000+" ||
        data.investor.investmentAmount === "$100,000 – $250,000" ||
        data.investor.investmentAmount === "$50,000 – $100,000"
      ) {
        scores.push(3); // HIGH
      } else if (data.investor.investmentAmount === "Less than $50,000") {
        // MEDIUM - This is one specific option
        scores.push(2);
      } else if (data.investor.investmentAmount === "Less than $10,000") {
        // LOW - This is another specific option
        scores.push(1);
      }

      // Question 2: Are you interested in a specific industry?
      if (
        data.investor.industryInterest === "Yes, I have a targeted industry"
      ) {
        scores.push(3); // HIGH
      } else if (
        data.investor.industryInterest === "No, I am open to profitable options"
      ) {
        scores.push(2); // MEDIUM
      } else {
        scores.push(1); // LOW (default for other responses)
      }
      break;

    case "Other (please specify)":
      // For "Other" profession, requires manual review - default to MEDIUM
      scores.push(2); // MEDIUM
      break;
  }

  // General Eligibility Questions for all users

  // Question 1: What's your main goal?
  // Note: mainGoal is an array in this case
  if (
    data.mainGoal.includes("Expanding my business internationally") ||
    data.mainGoal.includes("Establishing a new business") ||
    data.mainGoal.includes(
      "Obtaining a residency visa through business setup"
    ) ||
    data.mainGoal.includes("Investment opportunities in Dubai")
  ) {
    scores.push(3); // HIGH
  } else if (data.mainGoal.includes("Not sure yet, exploring options")) {
    scores.push(2); // MEDIUM
  } else {
    scores.push(1); // LOW (default for empty or other responses)
  }

  // Question 2: What budget range are you considering for setup?
  if (
    data.budgetRange === "$30,000+" ||
    data.budgetRange === "$10,000 – $30,000"
  ) {
    scores.push(3); // HIGH
  } else if (data.budgetRange === "$5,000 – $10,000") {
    scores.push(2); // MEDIUM
  } else if (data.budgetRange === "Less than $5,000") {
    scores.push(1); // LOW
  }

  // Question 3: Are you planning to move to Dubai within the next 6–12 months?
  if (data.movingToDubai === "Yes, I'm ready") {
    scores.push(3); // HIGH
  } else if (data.movingToDubai === "I'm considering it and need more info") {
    scores.push(2); // MEDIUM
  } else if (data.movingToDubai === "No, just exploring options") {
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