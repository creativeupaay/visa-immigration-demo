export interface AllLeads {
    _id:string
    formId: string;
    fullName: string;
    nationality: string;
    email: string;
    phone: string;
  
    leadStatus: leadStatus;
  
    timeToSubmit: number;
  
    additionalInfo?: Record<string, any>;
    createdAt:string
    updatedAt:string
  }

export enum leadStatus {
    INITIATED = "INITIATED",
    CONSULTATIONLINKSENT = "CONSULTATIONLINKSENT",
    CONSULTATIONSCHEDULED = "CONSULTATIONSCHEDULED" ,
    CONSULTATIONDONE = "CONSULTATIONDONE" ,
    PAYMENTLINKSENT = "PAYMENTLINKSENT",
    PAYMENTDONE = "PAYMENTDONE" ,
    REJECTED = "REJECTED"
  }

export enum leadPriority {
    HIGH = "HIGH",
    LOW = "LOW",
    MEDIUM = "MEDIUM"  
}

export interface ClientInfoType  {
  leadInfo: {
    name: string;
    email: string;
    phone: string;
    appliedFor: string;
    caseId: string;
    createdAt:string
  };
  leadStatus: string;
  consultationInfo: {
    consultationId:string,
    meetTime: string;
    status: string;
    joinUrl: string;
    rescheduleUrl:string;
  };
  paymentInfo: {
    status: string;
    method: string;
    invoice: string;
  };
  eligibilityForm: {
    fullName: { first: string; last: string };
    nationality: string;
    email: string;
    phone: string;
    additionalInfo: {
      education: string;
      experience: string;
      preferredProvince: string;
      city: string;
    };
  };
  
};
