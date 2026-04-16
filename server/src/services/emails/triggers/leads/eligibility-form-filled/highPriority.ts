import { EmailService } from '../../../EmailService';

export const sendHighPriorityLeadEmail = async (
  to: string,
  firstName: string,
  service: string,
  consultationLink: string
) => {
  const subject = `${firstName}, You're Eligible! We’re Holding a Spot for You`;
  const templateName = 'high-priority-form-filled';

  await EmailService.getInstance().sendEmail({
    to,
    subject,
    templateName,
    templateCategory: 'leads/eligibility-form-filled',
    variables: {
      FirstName: firstName,
      Service: service,
      ConsultationLink: consultationLink,
    },
  });
};
