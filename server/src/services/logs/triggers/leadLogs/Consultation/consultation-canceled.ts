import { createLog } from "../../../createLog";
import { logTypeEnum } from "../../../../../types/enums/enums";
import { formatDateTime } from "../../../../../utils/formatDateTime";
import { Types } from "mongoose";


export const logConsultationCanceled = async ({
  leadName,
  canceledAt = new Date(),
  doneBy = null,
  leadId,
}: {
  leadName: string;
  canceledAt?: Date;
  doneBy?: string | null;
  leadId : Types.ObjectId;
}) => {
  const dateTime = formatDateTime(canceledAt);
  const msg = `Consultation for "${leadName}" was canceled on ${dateTime}`;

  await createLog({
    logMsg: msg,
    doneBy,
    logType: logTypeEnum.LeadLogs,
    visaApplicationId :  null , 
    leadId : leadId
  });
};
