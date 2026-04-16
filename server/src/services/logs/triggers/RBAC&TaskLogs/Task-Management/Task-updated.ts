import { createLog } from "../../../createLog";
import { formatDateTime } from "../../../../../utils/formatDateTime";
import { logTypeEnum } from "../../../../../types/enums/enums";
import { Types } from "mongoose";
import {LogModel} from "../../../../../models/logsModels/logModel";

export const logTaskUpdated = async ({
  taskTitle,
  updatedFields,
  updatedAt = new Date(),
  doneBy = null,
  adminName,
  taskId 
}: {
  taskTitle: string;
  updatedFields: string[]; // e.g., ["status", "due date"]
  updatedAt?: Date;
  doneBy?: string | null;
  adminName?: string;
  taskId : Types.ObjectId | null;
}) => {
  const dateTime = formatDateTime(updatedAt);
  const fields = updatedFields.join(", ");
  const msg = `Task "${taskTitle}" was updated (${fields}) on ${dateTime} by ${adminName}`;

  await LogModel.create({
    logMsg: msg,
    logType: logTypeEnum.TaskLogs,
    taskId,
    doneBy
  });
};
