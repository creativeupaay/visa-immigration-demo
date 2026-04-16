import { ADMIN_EMAIL } from '../../../../../config/configLinks';
import { EmailService } from '../../../EmailService';

export const sendEmpCreationOtp = async ({
  creatorEmail ,
  otp ,
  creatorName , 
  expiresIn
}:{
  creatorEmail: string,
  otp: string,
  creatorName: string, 
  expiresIn: number
}) => {
  const subject = `OTP to Confirm New Admin Creation`;

  const templateName = "sendEmpCreationOtp";

  await EmailService.getInstance().sendEmail({
    to: creatorEmail,
    subject,
    templateName,
    templateCategory: 'admin/2FA-otp',
    variables: {
      creatorName,  // must match the template variable
      otp,
      expiresIn,
    },
  });
};
