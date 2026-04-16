import { EmailService } from '../../../EmailService';

export const employeeProfileUpdatedEmail = async ({
  to ,                          
  employeeName ,                
  updatedBy  ,                   
  updatedFields
} : {
  to: string,                          
  employeeName: string,                
  updatedBy?: string,                   
  updatedFields: Record<string, string> 
  }) => {
  const subject = `Your Admin Profile Has Been Updated`;
  const templateName = 'employee-details-edited';     
  const templateCategory = 'admin/RBAC';        

  await EmailService.getInstance().sendEmail({
    to,
    subject,
    templateName,
    templateCategory,
    variables: {
      employeeName,
      updatedBy,
      updatedFields,
    },
  });
};


