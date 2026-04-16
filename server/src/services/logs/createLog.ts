import { LogModel , ILog } from "../../models/logsModels/logModel";
import { logTypeEnum } from "../../types/enums/enums";
import { Types } from "mongoose";  


interface CreateLogInput {
  logMsg: string;
  doneBy?: string | null;
  logType: logTypeEnum;
  leadId: Types.ObjectId | null;
  visaApplicationId: Types.ObjectId | null;
}

export const createLog = async ({
  logMsg,
  doneBy = null,
  logType,
  leadId = null,
  visaApplicationId = null,
}: CreateLogInput) => {
  try {
    const logData: Partial<ILog> = {
      logMsg,
      doneBy,
      logType,
    };

    if (leadId) {
      logData.leadId = leadId as any; // cast to ObjectId if needed
    }

    if (visaApplicationId) {
      logData.visaApplicationId = visaApplicationId as any;
    }

    const createdLog = await LogModel.create(logData);
    console.log("Log created successfully:", createdLog);
  }
  catch (err) {
    console.error("Log creation failed:", err);
  }
};

