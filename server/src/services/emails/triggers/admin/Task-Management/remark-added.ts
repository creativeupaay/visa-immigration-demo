import { EmailService } from '../../../EmailService';

export const remarkAddedEmail = async ({
  to,
  assigneeName,
  taskName,
  remarkedBy,
  remarkedAt,
  remark
}:{
  to: string,
  assigneeName: string,
  taskName: string,
  remarkedBy?: string,
  remarkedAt: string,
  remark: string
}) => {
  const subject = `New Remark Added to Task: ${taskName}`;
  const templateName = 'remark-added';
  const templateCategory = 'admin/Task-Management';

  await EmailService.getInstance().sendEmail({
    to,
    subject,
    templateName,
    templateCategory,
    variables: {
      assigneeName,
      taskName,
      remarkedBy,
      remarkedAt,
      remark,
    },
  });
};
