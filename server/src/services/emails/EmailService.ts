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
  private constructor() {}

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

    console.log("[DEMO MODE] Email suppressed", {
      to: options.to,
      subject: options.subject,
      template: `${options.templateCategory}/${options.templateName}`,
      previewLength: html.length,
    });
  }
}
