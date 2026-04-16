import { EmailService } from '../../../EmailService';

export const taskCompletedEmail = async ({
  to,                 
  assigneeName ,    
  taskName  ,          
  completedBy ,       
  completedAt
}:{
  to: string,                  
  assigneeName: string,        
  taskName: string,            
  completedBy?: string,         
  completedAt: string 
}) => {
  const subject = `Task Completed: ${taskName}`;
  const templateName = 'task-completed'; 
  const templateCategory = 'admin/Task-Management'; 

  await EmailService.getInstance().sendEmail({
    to,
    subject,
    templateName,
    templateCategory,
    variables: {
      assigneeName,
      taskName,
      completedBy,
      completedAt,
    },
  });
};
