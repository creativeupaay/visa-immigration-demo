import { EmailService } from '../../../EmailService';

export const employeeAccountCreatedEmail = async ({
  to,               
  employeeName,     
  email,            
  password,         
  role,             
  loginUrl
} : {
    to: string,               
    employeeName: string,     
    email: string,            
    password: string,         
    role: string,             
    loginUrl: string
  }) => {
  const subject = `Welcome to E-360 – Your Admin Account is Ready`;
  const templateName = 'new-employee-created';     
  const templateCategory = 'admin/RBAC';      

  await EmailService.getInstance().sendEmail({
    to,
    subject,
    templateName,
    templateCategory,
    variables: {
      employeeName,
      email,
      password,
      role,
      loginUrl,
    },
  });
};
