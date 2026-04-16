import { EmailService } from '../../../EmailService';

export const sendMediumPriorityLeadEmail = async (
  to: string,
  firstName: string,
  service: string,
  consultationLink: string
) => {
  const subject = `${firstName}, You might Qualify but we need more information!`;
  const templateName = 'medium-priority-form-filled';

  // Send the email for medium priority lead
  await EmailService.getInstance().sendEmail({
    to,
    subject,
    templateName,
    templateCategory: 'leads/eligibility-form-filled',
    variables: {
      FirstName: firstName,
      Service: service,
      ExpertConsultationLink: consultationLink,
    },
  });
};
