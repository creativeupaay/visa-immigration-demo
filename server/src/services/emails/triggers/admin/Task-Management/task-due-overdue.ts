import { EmailService } from '../../../EmailService';

export const taskDueOverdueEmail = async (
  to: string,              
  assigneeName: string,    
  taskName: string,       
  startDate: string,       
  endDate: string,         
  status: string           
) => {
  const subject = `Reminder: Task is Now ${status} - ${taskName}`;
  const templateName = 'task-due-overdue'; 
  const templateCategory = 'admin/Task-Management';     

  await EmailService.getInstance().sendEmail({
    to,
    subject,
    templateName,
    templateCategory,
    variables: {
      assigneeName,
      taskName,
      startDate,
      endDate,
      status,
    },
  });
};
