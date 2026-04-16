import { EmailService } from '../../../EmailService';

export const assigneeAddedEmail = async (
  to: string,
  assigneeName: string,
  taskName: string,
  newAssigneeNames: string[],
  assignedBy?: string
) => {
  const subject = `New Members Added to Task: ${taskName}`;
  const templateName = 'assignee-added';
  const templateCategory = 'admin/Task-Management';

  await EmailService.getInstance().sendEmail({
    to,
    subject,
    templateName,
    templateCategory,
    variables: {
      assigneeName,
      taskName,
      newAssigneeNames,
      assignedBy,
    },
  });
};
