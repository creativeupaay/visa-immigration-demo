import { createLog } from "../../../createLog";
import { formatDateTime } from "../../../../../utils/formatDateTime";
import { logTypeEnum } from "../../../../../types/enums/enums";
import { Types } from "mongoose";


export const logNewEmployeeCreated = async ({
  employeeName,
  roleName ,
  employeeEmail,
  createdAt = new Date(),
  doneBy = null,
  doneByName,
}: {
  employeeName: string;
  roleName : string ;
  employeeEmail: string;
  createdAt?: Date;
  doneBy?: string | null;
  doneByName?: string;
}) => {
  const dateTime = formatDateTime(createdAt);
  const msg = `New employee "${employeeName}" (${employeeEmail}) with "${roleName}" role was added on ${dateTime} by Admin ${doneByName}`;

  await createLog({
    logMsg: msg,
    doneBy,
    logType: logTypeEnum.ActivityLogs,
    visaApplicationId :  null , 
    leadId : null
  });
};
