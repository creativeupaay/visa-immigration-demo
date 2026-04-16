export interface RecentUpdatesTypes {
  _id: string;
  logMsg: string;
  createdAt: string;
  visaApplicationId:string
}
 
export interface RevenueDataTypes {
    visaType: VisaTypeEnum;
    totalRevenue: number;
  }

export enum VisaTypeEnum {
    DOMINICA = "Dominica",
    GRENADA = "Grenada",
    PORTUGAL = "Portugal",
    DUBAI = "Dubai"
  }

export interface AnalyticsTypes{
  newLeadsLast30Days:number;
  leadConversionRate:string;
  pendingApplications:number
  completedApplications:number
}

