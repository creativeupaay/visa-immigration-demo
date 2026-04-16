import { WHATSAPP_LINK } from '../../../../../config/configLinks';
import { EmailService } from '../../../EmailService';

export const sendPortalAccessToClient = async (
  to: string,
  firstName: string,
  service: string,
  password: string,
) => {
  const subject = `Welcome Aboard, ${firstName} — Your ${service} Journey Begins Now`;
  const templateName = 'payment-successful';

  await EmailService.getInstance().sendEmail({
    to,
    subject,
    templateName,
    templateCategory: 'leads/payment',
    variables: {
      FirstName: firstName,
      Service: service,
      PortalLink: "https://app.e360consult.com",
      Email: to,
      Password: password,
      WhatsAppLink: WHATSAPP_LINK,
    },
  });
};
