import { EmailService } from '../../../EmailService';

export const taskEditedEmail = async ({
  to,                  
  assigneeName ,        
  taskName,         
  updatedBy,          
  updatedAt ,          
  updatedFields     
} : {
  to: string,                   
  assigneeName: string,         
  taskName: string,            
  updatedBy?: string,            
  updatedAt: string,            
  updatedFields: string[]       
}) => {
  const subject = `Task Updated: ${taskName}`;
  const templateName = 'task-edited';      
  const templateCategory = 'admin/Task-Management';  

  await EmailService.getInstance().sendEmail({
    to,
    subject,
    templateName,
    templateCategory,
    variables: {
      assigneeName,
      taskName,
      updatedBy,
      updatedAt,
      updatedFields,
    },
  });
};
