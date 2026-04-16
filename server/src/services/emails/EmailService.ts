import { Resend } from 'resend';
import { EmailTemplateManager } from './EmailTemplateManager';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  templateName: string;
  templateCategory: string;
  variables: Record<string, any>;
}

export class EmailService {
  private static instance: EmailService;
  private resend: Resend;

  private constructor() {
    this.resend = new Resend(process.env.RESEND_EMAIL_API_KEY!);
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  public async sendEmail(options: SendEmailOptions): Promise<void> {
    const html = EmailTemplateManager.compileTemplate(
      options.templateCategory,
      options.templateName,
      options.variables , 
      true  // false here indicates plain text
    );
    await this.resend.emails.send({
      from: `E360 Consult <${process.env.EMAIL_FROM}>`,
      to: options.to,
      subject: options.subject,
      html,
    });
  }
}
