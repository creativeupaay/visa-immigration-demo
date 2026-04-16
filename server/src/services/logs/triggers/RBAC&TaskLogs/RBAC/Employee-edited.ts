import { createLog } from "../../../createLog";
import { formatDateTime } from "../../../../../utils/formatDateTime";
import { logTypeEnum } from "../../../../../types/enums/enums";
import { Types } from "mongoose";


export const logEmployeeEdited = async ({
  employeeName,
  editedAt = new Date(),
  doneBy = null,
  doneByName,
}: {
  employeeName: string;
  editedAt?: Date;
  doneBy?: string | null;
  doneByName?: string; 
}) => {
  const dateTime = formatDateTime(editedAt);
  const msg = `Employee "${employeeName}"'s details were updated on ${dateTime} by Admin ${doneByName}`;

  await createLog({
    logMsg: msg,
    doneBy,
    logType: logTypeEnum.ActivityLogs,
    visaApplicationId :  null , 
    leadId : null
    
  });
};
