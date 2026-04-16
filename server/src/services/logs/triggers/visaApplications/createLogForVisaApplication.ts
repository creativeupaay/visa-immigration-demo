import { createLog } from "../../createLog";
import { logTypeEnum , VisaTypeEnum , StepStatusEnum , dgInvestStatusEnum , tradeNameStatus , moaStatusEnum , medicalTestStatus} from "../../../../types/enums/enums";
import { formatDateTime } from "../../../../utils/formatDateTime";
import { LogTrigger } from "../../../../models/VisaStep";
import { Types } from "mongoose";

import { getDominicaMessage }  from "../../logMessages/Dominica/dominicaMessage";
import { getDubaiMessage }     from "../../logMessages/Dubai/dubaiMessages";
import { getPortugalMessage }  from "../../logMessages/Portugal/portugalMessages";
import { getGrenadaMessage }   from "../../logMessages/Grenada/grenadaMessage";

// clientName
// visaType
// stepName
// adminName
// investmentOption
// messageId

export const createLogForVisaApplication = async ({
  triggers,
  clientName,
  visaType,
  stepName,
  stepStatus,          
  investmentOption = "",
  adminName = "",
  doneBy,
  visaApplicationId, 
}: {
  triggers: LogTrigger[];      
  clientName: string;
  visaType: VisaTypeEnum;      
  stepName: string;
  stepStatus: StepStatusEnum | dgInvestStatusEnum | tradeNameStatus | moaStatusEnum | medicalTestStatus ;
  investmentOption?: string;
  adminName?: string;
  doneBy?: string | null;
  visaApplicationId: Types.ObjectId;  
}) => {
  /** ---------- 1. Pick correct message‑builder fn ---------- */
  const visaMsgFnMap: Record<
    VisaTypeEnum,
    (
      clientName: string,
      visaType: string,
      stepName: string,
      adminName: string,
      investmentOption: string,
      messageId: string
    ) => string
  > = {
    [VisaTypeEnum.DOMINICA]: getDominicaMessage,
    [VisaTypeEnum.GRENADA]:  getGrenadaMessage,
    [VisaTypeEnum.PORTUGAL]: getPortugalMessage,
    [VisaTypeEnum.DUBAI]:    getDubaiMessage,
  };

  const messageFn = visaMsgFnMap[visaType];
  if (!messageFn) throw new Error(`Unsupported visaType: ${visaType}`);

  /** ---------- 2. Filter triggers whose status === stepStatus ---------- */
  const matchedTriggers = triggers?.filter(t => t.status === stepStatus);

  if (!matchedTriggers || matchedTriggers.length === 0) {
    // No work to do – silently return or throw, your choice
    return;
  }

  /** ---------- 3. Build messages for each matched trigger ---------- */
  const logPromises = matchedTriggers.map(({ messageId }) => {
    const msg = messageFn(
      clientName,
      visaType,
      stepName,
      adminName ?? "",
      investmentOption ?? "",
      messageId
    );

    /** ---------- 4. Create log for this messageId ---------- */
    return createLog({
      logMsg: msg,
      doneBy,
      logType: logTypeEnum.VisaApplicationLogs,
      visaApplicationId :  visaApplicationId , 
      leadId : null
    });
  });

  /** ---------- 5. Wait for all logs to be inserted ---------- */
  await Promise.all(logPromises);
};



