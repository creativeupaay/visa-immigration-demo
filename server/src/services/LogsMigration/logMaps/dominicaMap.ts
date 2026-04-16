


export const dominicaLogMap: Record<string, { status: string; messageId: string }[]> = {
    "Upload Documents": [
      { status: "SUBMITTED", messageId: "dominica-user-documents-submitted" },
      { status: "APPROVED",  messageId: "dominica-user-documents-approved"  }
    ],
    "Due Diligence & Application Submission": [
      { status: "APPROVED",  messageId: "dominica-user-due-diligence"    }
    ],
    "Investment & Government Processing": [
      { status: "optionSelected"           ,  messageId: "dominica-user-investment-option-selected"   },
      { status: "realStateOptionsUploaded" ,  messageId: "dominica-admin-added-options-for-realState"    },
      { status: "paymentDone"              ,  messageId: "dominica-user-upload-invoice"    }
    ],
    "Approval & Passport Issuance": [
      { status: "APPROVED", messageId: "dominica-user-government-approval"   }
    ],
    "Passport Copy": [
      { status: "SUBMITTED", messageId: "dominica-admin-passport-uploaded"   }
    ],
    "Passport Delivery": [
      { status: "SUBMITTED", messageId: "dominica-user-delivery-details-submitted"   },
      { status: "APPROVED",  messageId: "dominica-admin-shipping-details-submitted"    }
    ],
  };
  
