import { createLog } from "../../../createLog";
import { formatDateTime } from "../../../../../utils/formatDateTime";
import { logTypeEnum } from "../../../../../types/enums/enums";
import { Types } from "mongoose";
import {LogModel} from "../../../../../models/logsModels/logModel";

export const logNewTaskCreated = async ({
  taskTitle,
  assignedTo,
  createdAt = new Date(),
  adminName,
  taskId , 
  doneBy 
}: {
  taskTitle: string;
  assignedTo: string[];
  createdAt?: Date;
  adminName?: string;
  taskId: Types.ObjectId | null;
  doneBy? : string | null
}) => {
  const dateTime = formatDateTime(createdAt);
  const assignedToUsers = assignedTo.join(", ");
  const msg = `New task "${taskTitle}" assigned to (${assignedToUsers}) was created on ${dateTime} by ${adminName}`;

  await LogModel.create({
    logMsg: msg,
    logType: logTypeEnum.TaskLogs,
    taskId,
    doneBy
  });
};
