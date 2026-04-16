import { ADMIN_EMAIL } from '../../../../../config/configLinks';
import { EmailService } from '../../../EmailService';

export const consultationCallScheduledAdmin = async (
  firstName: string, 
  service: string, 
  callDateTime:string,
  meetingLink:string,
) => {
  const subject = `Consultation Booked – ${firstName} for ${service}`;

  const templateName="consultation-call-scheduled"
  await EmailService.getInstance().sendEmail({
    to:ADMIN_EMAIL,
    subject,
    templateName,
    templateCategory: 'admin/consultation',
    variables: {
      FirstName: firstName,
      Service: service,
      CallDateTime: callDateTime,
      MeetingLink: meetingLink,
    },
  });
};