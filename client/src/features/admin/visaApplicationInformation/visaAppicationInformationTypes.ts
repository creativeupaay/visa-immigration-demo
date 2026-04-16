export interface RequirementTypes {
    reqStatusId: string;
    question: string;
    requirementType: "PDF" | "DROPDOWN"; 
    reqCategory: "GENRAL" | "TRADE_NAME" | "BANK" | "MEDICAL"; // add others if needed
    options: any[]; 
    required: boolean;
    reqStatus: "NOT_UPLOADED" | "UPLOADED"; 
    reason: string | null;
    value: string | null;
  }
  
  export interface StepData {
    currentStepStatusId	:string;
    totalSteps: number;
    currentStepNumber: number;
    stepType: string; 
    stepSource: string;
    stepStatus: string;
    requirements: RequirementTypes[];
  }
  