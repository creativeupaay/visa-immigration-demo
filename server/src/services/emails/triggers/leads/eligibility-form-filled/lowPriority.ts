import { EmailService } from '../../../EmailService';

export const sendLowPriorityLeadEmail = async (
  to: string,
  firstName: string,
  service: string,
  blogLink: string,
  newsletterSignUpLink: string
) => {
  const subject = `${firstName}, Thank You for Your Interest!`;
  const templateName = 'low-priority-form-filled';

  // Send the email for low priority lead
  await EmailService.getInstance().sendEmail({
    to,
    subject,
    templateName,
    templateCategory: 'leads/eligibility-form-filled',
    variables: {
      FirstName: firstName,
      Service: service,
      BlogLink: blogLink,
      NewsletterSignUpLink: newsletterSignUpLink,
    },
  });
};
