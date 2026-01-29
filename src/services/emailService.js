import sendinblue from "sib-api-v3-sdk";

const defaultClient = sendinblue.ApiClient.instance;
const apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new sendinblue.TransactionalEmailsApi();

export async function sendEmail(toEmail, subject, htmlContent) {
  const sendSmtpEmail = new sendinblue.SendSmtpEmail();
  
  sendSmtpEmail.to = [{ email: toEmail }];
  sendSmtpEmail.sender = { email: process.env.SENDER_EMAIL, name: "Automated System" };
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = htmlContent;

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`Email sent to ${toEmail}. Message ID: ${data.messageId}`);
    return data;
  } catch (error) {
    console.error(`Error sending email to ${toEmail}:`, error.message);
    throw error;
  }
}

export function validateBrevoConfig() {
  if (!process.env.BREVO_API_KEY) throw new Error("BREVO_API_KEY is missing");
  if (!process.env.SENDER_EMAIL) throw new Error("SENDER_EMAIL is missing");
}

import nodemailer from "nodemailer";

export async function sendAdminEmail(toEmail, subject, htmlContent) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: toEmail,
    subject: subject,
    html: htmlContent,
  };

  try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`Admin Email sent to ${toEmail}. Message ID: ${info.messageId}`);
      return info;
  } catch (error) {
      console.error(`Error sending admin email to ${toEmail}:`, error.message);
      throw error;
  }
}
