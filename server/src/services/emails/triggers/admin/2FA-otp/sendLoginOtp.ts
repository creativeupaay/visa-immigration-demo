import { ADMIN_EMAIL } from '../../../../../config/configLinks';
import { EmailService } from '../../../EmailService';

export const sendLoginOtp = async ({
  email, 
  otp,
  name,         
  expiresIn     
}:{
  email: string, 
  otp: string,
  name: string,         
  expiresIn: number     
}) => {
  const subject = `Here is your OTP`;

  const templateName = "sendLoginOtp"; 

  const response = await EmailService.getInstance().sendEmail({
    to: email,
    subject,
    templateName,
    templateCategory: 'admin/2FA-otp',
    variables: {
      name,
      otp,
      expiresIn,
    },
  });
  console.log("Login OTP email sent successfully:", response);
};
