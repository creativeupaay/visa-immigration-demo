export enum AccountStatusEnum {
  ACTIVE = 'ACTIVE',                                      // Account is active and fully operational.
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',          // Account is awaiting email verification or admin approval.
  SUSPENDED = 'SUSPENDED',                                // Account is temporarily suspended (e.g., due to policy violations).
  CLOSED = 'CLOSED',                                      // Account has been closed (voluntary or due to violation).
  BANNED = 'BANNED',                                      // Account has been permanently banned (e.g., for illegal activities).
  INACTIVE = 'INACTIVE',                                  // Account is inactive, often due to a long period of no activity.
  LOCKED = 'LOCKED',                                      // Account is temporarily locked due to security concerns (e.g., failed logins).
  EXPIRED = 'EXPIRED',                                    // Account or subscription has expired (e.g., subscription ended).
}


export enum RoleEnum {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export enum VisaTypeEnum {
  DOMINICA = "Dominica",
  GRENADA = "Grenada",
  PORTUGAL = "Portugal",
  DUBAI = "Dubai"
}

export enum FileType {
  IMAGE = "image",
  PDF = "pdf"
}

export enum DocumentSourceEnum {
  ADMIN = "ADMIN",
  USER = "USER"
}

export enum QuestionTypeEnum {
  TEXT = "TEXT",  // Text input.
  EMAIL = "EMAIL", //Email input.
  PHONE_NUMBER = "PHONE_NUMBER",
  DOB = "DOB",
  RADIO = "RADIO",
  CHECKBOX = "CHECKBOX",
  DROPDOWN = "DROPDOWN",
  IMAGE = "IMAGE",
  PDF = "PDF",
  SIGNATURE="SIGNATURE"
}

export enum VisaApplicationStatusEnum {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  REJECTED = "REJECTED", // when admin mark this as Rejected 
  COMPLETED="COMPLETED",
  CANCELED="CANCELED"
}

export enum StepStatusEnum {
  IN_PROGRESS = "IN_PROGRESS",
  SUBMITTED = "SUBMITTED",
  APPROVED="APPROVED",
  REJECTED = "REJECTED", 
}

export enum visaApplicationReqStatusEnum{
  NOT_UPLOADED="NOT_UPLOADED",
  UPLOADED ="UPLOADED",
  VERIFIED="VERIFIED",  
  RE_UPLOAD="RE_UPLOAD",
}

export enum StepTypeEnum {
  MEDICAL_TEST = "MEDICAL_TEST",
  DUBAI_PAYMENT = "DUBAI_PAYMENT",
  TRADE_NAME = "TRADE_NAME",
  MOA_SIGNING = "MOA_SIGNING",
  BANK = "BANK",
  DGDELIVERY = "DGDELIVERY",
  GENERAL = "GENERAL",
  DGINVESTMENT = "DGINVESTMENT",
  STATUSUPDATE = "STATUSUPDATE" , 
  EMPTY = "EMPTY",
  AIMA = "AIMA",
}

export enum reqCategoryEnum {
  GENRAL = "GENRAL" , 
  SPOUSE  =  "SPOUSE" , 
  CHILD   =  "CHILD",
  TIME_SENSITIVE = "TIME_SENSITIVE"
}


export enum leadPriority {
  HIGH = "HIGH",
  LOW = "LOW",
  MEDIUM = "MEDIUM"  
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

export enum consultationStatus {
  SCHEDULED = "SCHEDULED",
  COMPLETED = "COMPLETED",
}

export enum paymentStatus {
  LINKSENT = "LINKSENT",
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
  SESSIONEXPIRED = "SESSIONEXPIRED"
}

export enum paymentPurpose{
  CONSULTATION="CONSULTATION",
  DUBAI_PAYMENT="DUBAI_PAYMENT",
}


export enum dgInvestStatusEnum {
  optionSelected = "optionSelected",
  realStateOptionsUploaded = "realStateOptionsUploaded",
  paymentDone = "paymentDone",
}


export enum investmentOptionEnum {
  EDF = "EDF",
  NTF = "NTF",
  REAL_STATE = "REAL_STATE",
}

export enum aimaStatusEnum {
  Appointment_Scheduled = "AIMA Appointment Scheduled",
  Visa_Approved = "Visa Approved",
  Appointment_Confirmed = "Appointment Confirmed",
  Application_Approved = "Application Approved",
}

export enum tradeNameStatus{
  Pending = "Pending",
  TradeNames_Uploaded = "TradeNames_Uploaded",
  TradeName_Assigned = "TradeName_Assigned",
  ChangeReq_Sent = "ChangeReq_Sent",
  ChangeReq_Approved = "ChangeReq_Approved",
  ChangeReq_Rejected =  "ChangeReq_Rejected"
}

export enum moaStatusEnum{
  MOA_Preparing = "MOA_Preparing",
  MOA_Uploaded  = "MOA_Uploaded",
  Sig_Uploaded  = "Sig_Uploaded",
  Sig_Approved  = "Sig_Approved"
}

export enum medicalTestStatus{
  Pending = "Pending",
  Scheduled  = "Scheduled",
  Completed  = "Completed",
  RescheduleReq_Sent = "RescheduleReq_Sent",
  RescheduleReq_Approved = "RescheduleReq_Approved",
  RescheduleReq_Rejected = "RescheduleReq_Rejected"
}

export enum CustomFieldTypeEnum {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  DROPDOWN = 'dropdown',
  CHECKBOX = "CheckBox"
}

export enum PaymentSourceEnum {
  STRIPE = 'Stripe',
  DIRECT = 'Direct'
}

export enum senderTypeEnum {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export enum messageTypeEnum {
  FileMsg = 'fileMsg',
  TextMsg = 'textMsg'
}

export enum logTypeEnum {
  LeadLogs = 'leadLogs',
  ActivityLogs = 'activityLogs',
  VisaApplicationLogs = 'visaApplicationLogs',
  TaskLogs = "taskLogs"
  
}

export enum taskPriorityEnum {
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low'
}

export enum taskStatusEnum {
  COMPLETED = 'Completed',
  DUE = 'Due',
  OVERDUE = 'Overdue'
}

// Additional doc enums 

export enum additionalDocVisaType {
  PORTUGAL = 'Portugal',
  DUBAI = 'Dubai',
}

export enum additionalDocStatusEnum {
  NOT_UPLOADED="NOT_UPLOADED",
  UPLOADED ="UPLOADED",
  VERIFIED="VERIFIED",  
  RE_UPLOAD="RE_UPLOAD",
}

