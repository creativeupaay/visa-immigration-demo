import { createLog } from "../../../createLog";
import { logTypeEnum } from "../../../../../types/enums/enums";
import { formatDateTime } from "../../../../../utils/formatDateTime";
import { Types } from "mongoose";


export const logConsultationLinkSent = async ({
  leadName,
  sentAt = new Date(),
  doneBy = null,
  adminName,
  leadId,
}: {
  leadName: string;
  sentAt?: Date;
  doneBy?: string | null;
  adminName?: string;
  leadId : Types.ObjectId;
}) => {
  const dateTime = formatDateTime(sentAt);
  const msg = `Consultation link sent to "${leadName}" on ${dateTime} by Admin(${adminName}) `;

  await createLog({
    logMsg: msg,
    doneBy,
    logType: logTypeEnum.LeadLogs,
    visaApplicationId :  null , 
    leadId : leadId
  });
};
