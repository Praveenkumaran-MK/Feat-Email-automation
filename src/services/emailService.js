import brevo from "@getbrevo/brevo";

const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

export async function sendEmail(toEmail, subject, htmlContent) {
  const email = {
    sender: { email: process.env.SENDER_EMAIL },
    to: [{ email: toEmail }],
    subject,
    htmlContent,
  };

  try {
    await apiInstance.sendTransacEmail(email);
    console.log(`Email sent to ${toEmail}`);
  } catch (err) {
    console.error("Email failed:", err.message);
  }
}
