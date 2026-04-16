

export const dubaiLogMap: Record<string, { status: string; messageId: string }[]> = {
    "Upload Documents": [
      { status: "SUBMITTED", messageId: "dubai-user-documents-submitted" },
      { status: "APPROVED",  messageId: "dubai-user-documents-approved"  }
    ],
    "Trade Name Registration": [
      { status: "TradeNames_Uploaded", messageId: "dubai-user-tradeNameOptions-sent"   },
      { status: "TradeName_Assigned",  messageId: "dubai-admin-tradename-assigned"    },
      { status: "ChangeReq_Sent"    ,  messageId: "dubai-user-tradename-req-for-change"    },
      { status: "ChangeReq_Approved",  messageId: "dubai-admin-approved-change-req"    },
      { status: "ChangeReq_Rejected",  messageId: "dubai-admin-rejected-change-req"    }
    ],
    "Initial Approval": [
      { status: "APPROVED", messageId: "dubai-admin-granted-initial-approval"   },
    ],
    "Payment": [
      { status: "SUBMITTED", messageId: "dubai-user-payment-done" },
    ],
    "MOA Signing": [
      { status: "MOA_Uploaded", messageId: "dubai-admin-moa-uploaded" },
      { status: "Sig_Uploaded",  messageId: "dubai-user-signature-submitted"  },
      { status: "Sig_Approved",  messageId: "dubai-admin-signature-approved"  }
    ],
    "License Issuance": [
      { status: "APPROVED", messageId: "dubai-user-business-license-approved" },
    ],
    "Establishment Card & VISA Processing": [
      { status: "APPROVED", messageId: "dubai-admin-establishment-card-approved" },
    ],
    "Medical Test": [
      { status: "Scheduled"             , messageId: "dubai-user-medical-test-submitted" },
      { status: "Completed"             ,  messageId: "dubai-admin-marked-as-completed"  },
      { status: "RescheduleReq_Sent"    ,  messageId: "dubai-user-sent-reScheduling-req"  },
      { status: "RescheduleReq_Approved",  messageId: "dubai-admin-approved-reScheduling-req"  },
      { status: "RescheduleReq_Rejected",  messageId: "dubai-admin-rejected-reScheduling-req"  }
    ],
    "Medical Certificate Issuance": [
      { status: "SUBMITTED", messageId: "dubai-admin-medical-certificate-uploaded" }
    ],
    "Visa Application & Emirates ID Registration": [
      { status: "SUBMITTED", messageId: "dubai-admin-emirates-visa-approved" },
    ],
    "Additional Documents": [
      { status: "SUBMITTED", messageId: "dubai-user-additional-documents-uploaded" },
      { status: "APPROVED", messageId: "dubai-admin-additional-documents-approved" }
    ],
    "Bank Account Opening & Final Business Setup": [
      { status: "SUBMITTED", messageId: "dubai-admin-bank-account-opene" }
    ],
  };
  


  