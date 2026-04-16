import { createLog } from "../../../createLog";
import { logTypeEnum } from "../../../../../types/enums/enums" ;
import { Types } from "mongoose";


export const logConsultationScheduled = async ({
  leadName,
  scheduledAt,
  doneBy = null,
  leadId,
}: {
  leadName: string;
  scheduledAt: Date;
  doneBy?: string | null;
  leadId : Types.ObjectId;
}) => {
  await createLog({
    logMsg: `Consultation scheduled for "${leadName}" on ${scheduledAt.toLocaleString()}`,
    logType: logTypeEnum.LeadLogs,
    doneBy,
    visaApplicationId :  null , 
    leadId : leadId
  });
};
