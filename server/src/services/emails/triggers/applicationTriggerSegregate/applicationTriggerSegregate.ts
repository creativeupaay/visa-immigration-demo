import { EmailTrigger } from "../../../../models/VisaStep";
import { StepStatusEnum, VisaTypeEnum } from "../../../../types/enums/enums";
import { adminApplicationUpdateSend } from "../admin/application/applicationTriggers";
import { userApplicationUpdateSend } from "../customer/application/applicationTriggers";

export const sendApplicationUpdateEmails = async ({
  triggers,
  stepStatus,
  visaType,
  email,
  firstName,
}: {
  triggers: EmailTrigger[];
  stepStatus: StepStatusEnum;
  visaType: string;
  email: string;
  firstName: string;
}) => {

  const userTriggers = triggers.filter(
    (trigger) => trigger.to === "USER" && trigger.status === stepStatus
  );
  const adminTriggers = triggers.filter(
    (trigger) => trigger.to === "ADMIN" && trigger.status === stepStatus
  );

  console.log("Admin Triggers",adminTriggers)

  const emailPromises: Promise<void>[] = [];

  if (userTriggers.length) {
    emailPromises.push(userApplicationUpdateSend(userTriggers, email, firstName, visaType));
  }

  if (adminTriggers.length) {
    emailPromises.push(adminApplicationUpdateSend(adminTriggers, firstName, visaType));
  }

  await Promise.all(emailPromises);
};
