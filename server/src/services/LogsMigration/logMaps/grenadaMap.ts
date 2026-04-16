

export const grenadaLogMap: Record<string, { status: string; messageId: string }[]> = {
  "Upload Documents": [
    { status: "SUBMITTED", messageId: "grenada-user-documents-submitted" },
    { status: "APPROVED",  messageId: "grenada-user-documents-approved"  }
  ],
  "Due Diligence & Application Submission": [
    { status: "APPROVED",  messageId: "grenada-user-due-diligence"    }
  ],
  "Investment & Government Processing": [
    { status: "optionSelected"           ,  messageId: "grenada-user-investment-option-selected"   },
    { status: "realStateOptionsUploaded" ,  messageId: "grenada-admin-added-options-for-realState"    },
    { status: "paymentDone"              ,  messageId: "grenada-user-upload-invoice"    }
  ],
  "Approval & Passport Issuance": [
    { status: "APPROVED", messageId: "grenada-user-government-approval"   }
  ],
  "Passport Copy": [
    { status: "SUBMITTED", messageId: "grenada-admin-passport-uploaded"   }
  ],
  "Passport Delivery": [
    { status: "SUBMITTED", messageId: "grenada-user-delivery-details-submitted"   },
    { status: "APPROVED",  messageId: "grenada-admin-shipping-details-submitted"    }
  ],
};