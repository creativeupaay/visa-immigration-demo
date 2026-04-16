import { EmailService } from '../../../EmailService';

export const taskAssignedEmail = async ({
  to,
  assigneeName,
  taskName,
  priority,
  startDate,
  endDate,
  assignedBy,
}: {
  to: string;
  assigneeName: string;
  taskName: string;
  priority: string;
  startDate: string;
  endDate: string;
  assignedBy?: string;
})=> {
  const subject = `New Task Assigned: ${taskName}`;
  const templateName = 'task-assigned';           
  const templateCategory = 'admin/Task-Management';    

  await EmailService.getInstance().sendEmail({
    to,
    subject,
    templateName,
    templateCategory,
    variables: {
      assigneeName,
      taskName,
      priority,
      startDate,
      endDate,
      assignedBy,
    },
  });
};
