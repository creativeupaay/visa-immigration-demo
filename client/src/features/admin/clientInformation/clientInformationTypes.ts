export type  ConsultationInfoTypes = {
    consultationId:string,
    meetTime : string,
    joinUrl: string,
    status:string
    rescheduleUrl:string;
} | null

export type  PaymentInfoTypes = {
    status:string,
    method:string,
    invoice:string
} | null 

export type EligibilityFormTypes =  {
    [key: string]: string | number | boolean | null | EligibilityFormTypes | Array<any>;
  } | null