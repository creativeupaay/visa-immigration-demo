// interface EmailOptions {
//   to: string;
//   subject: string;
//   html?: string;
//   text?: string;
// }

// export const sendEmail = async (emailOptions: EmailOptions): Promise<void> => {
//   if (
//     !process.env.AWS_ACCESS_KEY_ID ||
//     !process.env.AWS_SECRET_ACCESS_KEY ||
//     !process.env.AWS_REGION ||
//     !process.env.EMAIL_FROM
//   ) {
//     throw new Error("Missing required environment variables");
//   }

//   const sesClient = new SESClient({
//     region: process.env.AWS_REGION,
//     credentials: {
//       accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//       secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//     },
//   });

//   const body: { Html?: { Data: string }; Text?: { Data: string } } = {};

//   if (emailOptions.html) {
//     body.Html = { Data: emailOptions.html };
//   }
//   if (emailOptions.text) {
//     body.Text = { Data: emailOptions.text };
//   }

//   const params = {
//     Source: process.env.EMAIL_FROM,
//     Destination: {
//       ToAddresses: [emailOptions.to],
//     },
//     Message: {
//       Subject: {
//         Data: emailOptions.subject,
//       },
//       Body: body,
//     },
//   };

//   try {
//     const command = new SendEmailCommand(params);
//     const response = await sesClient.send(command);
//     console.log("Email sent successfully:", response.MessageId);
//   } catch (error) {
//     console.error("Error sending email:", error);
//     throw new Error("Failed to send email");
//   }
// };



export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
}



export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<any> {
  console.log('[DEMO MODE] Email suppressed', {
    to,
    subject,
    previewLength: html.length,
  });

  return { id: 'demo-mode-email-suppressed' };
}





// from , to , subject , html