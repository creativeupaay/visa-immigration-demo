import { EmailService } from '../../../EmailService';

export const sendPaymentLinkToLead = async (
  to: string,
  firstName: string,
  service: string,
  paymentLink: string
) => {
  const subject = `Your Next Step Towards ${service}`;
  const templateName = 'payment-link-send';

  await EmailService.getInstance().sendEmail({
    to,
    subject,
    templateName,
    templateCategory: 'leads/payment',
    variables: {
      FirstName: firstName,
      Service: service,
      PaymentLink: paymentLink,
    },
  });
};
