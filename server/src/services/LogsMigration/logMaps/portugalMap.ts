

export const portugalLogMap: Record<string, { status: string; messageId: string }[]> = {
    "Upload Documents": [
      { status: "SUBMITTED", messageId: "portugal-user-documents-submitted" },
      { status: "APPROVED",  messageId: "portugal-user-documents-approved"  }
    ],
    "NIF Request & Confirmation": [
      { status: "SUBMITTED", messageId: "portugal-user-nif-submitted"   },
      { status: "APPROVED",  messageId: "portugal-admin-nif-uploaded"    }
    ],
    "Bank Account Opening & Confirmation": [
      { status: "APPROVED", messageId: "portugal-bank-opened"   },
    ],
    "Visa Submission & Processing": [
      { status: "APPROVED", messageId: "portugal-aima-scheduled"   },
    ],
    "Visa Approval": [
      { status: "APPROVED", messageId: "portugal-visa-approved"   },
    ],
    
  };


  export enum StepStatusEnum {
    // IN_PROGRESS = "IN_PROGRESS",
    // SUBMITTED = "SUBMITTED",
    // APPROVED="APPROVED",
    // REJECTED = "REJECTED", 
  }
  