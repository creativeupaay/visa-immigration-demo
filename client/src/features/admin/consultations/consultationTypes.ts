export interface AllConsultationsTypes {
  _id: string;
  name: string;
  email: string;
  status: "SCHEDULED" | "CANCELLED" | "COMPLETED" | "MISSED";
  startTime: string;
  endTime: string;
  joinUrl: string;
  rescheduleUrl?: string;
  calendlyEventUrl: string;
  formattedDate: string;
  leadId: string;
  __v: number;
}
