import { EmailTrigger } from "../../../../../models/VisaStep";
import { ADMIN_EMAIL, DASHBOARD_LINK } from "../../../../../config/configLinks";
import { EmailService } from "../../../EmailService";
import { VisaTypeEnum } from "../../../../../types/enums/enums";
import { getDgAdminSubject } from "../../../templates/admin/application/DominicaGrenada/dg-subject";
import { getServiceType } from "../../../../../utils/leadToServiceType";
import { getPortugalAdminSubject } from "../../../templates/admin/application/Portugal/portugal-subject";
import { getDubaiAdminSubject } from "../../../templates/admin/application/Dubai/dubai-subjects";



// Suppose stepStatus is also coming...
export const adminApplicationUpdateSend = async (
  triggers: EmailTrigger[],
  customerName: string,
  visaType: string
) => {
  let templateCategory = "";
  let subjectFn: (firstName: string, templateId: string) => string;

  if (visaType === "Dominica" || visaType === "Grenada") {
    templateCategory = "admin/application/DominicaGrenada";
    subjectFn = getDgAdminSubject;
  } else if (visaType === VisaTypeEnum.PORTUGAL) {
    templateCategory = "admin/application/Portugal";
    subjectFn = getPortugalAdminSubject;
  } else if (visaType === VisaTypeEnum.DUBAI) {
    templateCategory = "admin/application/Dubai";
    subjectFn = getDubaiAdminSubject;
  }

  const emailPromises = triggers.map(async (trigger) => {
    const { templateId } = trigger;
    const subject = subjectFn
      ? subjectFn(customerName, templateId)
      : "Application Update";

    console.log("Admin Email Trigger", {
      customerName,
      templateId,
      subject,
      templateCategory,
    });
    return EmailService.getInstance().sendEmail({
      to: ADMIN_EMAIL,
      subject,
      templateName: templateId,
      templateCategory,
      variables: {
        CustomerName: customerName,
        AdminPortalLink: DASHBOARD_LINK,
        Service: getServiceType(visaType),
      },
    });
  });

  await Promise.all(emailPromises);
};
