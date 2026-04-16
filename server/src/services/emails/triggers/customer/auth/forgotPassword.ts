import { EmailService } from '../../../EmailService';

export const sendForgotPasswordEmail = async (
  name: string | undefined,
  resetLink: string,
  email: string,
) => {
  const fallbackName = 'there';   
  const displayName = name?.trim() || fallbackName;

  const subject = `New Password`;

  await EmailService.getInstance().sendEmail({
    to: email,
    subject,
    templateName: 'forgot-password',
    templateCategory: 'customer/auth',
    variables: {
      Name: displayName,
      ResetLink: resetLink,
    },
  });
};
