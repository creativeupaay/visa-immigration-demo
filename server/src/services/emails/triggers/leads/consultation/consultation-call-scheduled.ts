import { WHATSAPP_LINK } from '../../../../../config/configLinks';
import { leadPriority } from '../../../../../types/enums/enums';
import { EmailService } from '../../../EmailService';

export const constultationCallScheduled = async (
  to: string, 
  firstName: string, 
  service: string, 
  callDateTime: string,
  meetingLink:string,
  priority:leadPriority
) => {
  let subject = '';
  let templateName = '';

  switch (priority) {
    case leadPriority.HIGH:
      subject = `${firstName}, Your Consultation Call is Confirmed`;
      templateName = 'consultation-call-high-priority';
      break;
    case leadPriority.MEDIUM:
      subject = `${firstName}, Your Call is Confirmed – Let’s Discuss Your Eligibility`;
      templateName = 'consultation-call-medium-priority';
      break;
  }

  await EmailService.getInstance().sendEmail({
    to,
    subject,
    templateName,
    templateCategory: 'leads/consultation',
    variables: {
      FirstName: firstName,
      Service: service,
      CallDateTime: callDateTime,
      MeetingLink: meetingLink,
      WhatsappLink: WHATSAPP_LINK
    },
  });
};




