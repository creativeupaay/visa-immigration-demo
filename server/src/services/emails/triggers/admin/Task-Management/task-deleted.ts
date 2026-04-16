import { EmailService } from '../../../EmailService';

export const taskDeletedEmail = async (
  to: string,                  
  assigneeName: string,        
  taskName: string,            
  deletedBy: string,           
  deletedAt: string            
) => {
  const subject = `Task Deleted: ${taskName}`;
  const templateName = 'task-deleted'; 
  const templateCategory = 'admin/Task-Management'; 

  await EmailService.getInstance().sendEmail({
    to,
    subject,
    templateName,
    templateCategory,
    variables: {
      assigneeName,
      taskName,
      deletedBy,
      deletedAt,
    },
  });
};
