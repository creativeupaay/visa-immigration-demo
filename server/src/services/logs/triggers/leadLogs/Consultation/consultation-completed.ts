import { createLog } from "../../../createLog";
import { logTypeEnum } from "../../../../../types/enums/enums";
import { formatDateTime } from "../../../../../utils/formatDateTime";
import { Types } from "mongoose";


export const logConsultationCompleted = async ({
  leadName = "Unknown lead",
  completedAt = new Date(),
  doneBy = null,
  adminName = "Unknown Admin",
  leadId
}: {
  leadName?: string;
  completedAt?: Date;
  doneBy?: string | null;
  adminName?: string;
  leadId : Types.ObjectId;
}) => {
  const dateTime = formatDateTime(completedAt);
  const msg = `Consultation with "${leadName}" marked as completed on ${dateTime} by Admin(${adminName})`;

  await createLog({
    logMsg: msg,
    doneBy,
    logType: logTypeEnum.LeadLogs,
    visaApplicationId :  null , 
    leadId : leadId
  });
};
