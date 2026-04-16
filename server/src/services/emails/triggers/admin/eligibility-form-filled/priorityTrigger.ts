import { ADMIN_EMAIL, DASHBOARD_LINK } from '../../../../../config/configLinks';
import { EmailService } from '../../../EmailService';

export const leadEmailToAdmin = async (
  firstName: string, 
  service: string, 
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
) => {
  let subject = '';
  let templateName = '';

  switch (priority) {
    case 'HIGH':
      subject = `High-Priority Lead Alert: ${firstName} – ${service}`;
      templateName = 'high-priority-form-filled';
      break;
    case 'MEDIUM':
      subject = `Review Needed: Potential Lead for ${firstName} – ${service}`;
      templateName = 'medium-priority-form-filled';
      break;
    case 'LOW':
      subject = `Non-Eligible Lead for ${firstName} – ${service}`;
      templateName = 'low-priority-form-filled';
      break;
  }

  await EmailService.getInstance().sendEmail({
    to:ADMIN_EMAIL,
    subject,
    templateName,
    templateCategory: 'admin/eligibility-form-filled',
    variables: {
      FirstName: firstName,
      Service: service,
      LinkToDashboard: DASHBOARD_LINK,
    },
  });
};