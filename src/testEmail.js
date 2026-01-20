import "dotenv/config";
import { sendEmail } from "./services/emailService.js";

console.log("\n🧪 TESTING ACTUAL EMAIL SEND\n");
console.log("Brevo API Key:", process.env.BREVO_API_KEY ? "✅ Set" : "❌ Missing");
console.log("Sender Email:", process.env.SENDER_EMAIL || "❌ Missing");
console.log();

const testEmail = process.env.ADMIN_EMAIL || "mkpk3426@gmail.com";

console.log(`📧 Sending test email to: ${testEmail}\n`);

try {
  await sendEmail(
    testEmail,
    "🧪 Email Automation Test - " + new Date().toLocaleString(),
    `
    <html>
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #2563eb;">✅ Email System is Working!</h2>
        <p>This is a test email from your Email Automation system.</p>
        <p><strong>Sent at:</strong> ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}</p>
        <p><strong>From:</strong> ${process.env.SENDER_EMAIL}</p>
        <hr>
        <p style="color: #666; font-size: 12px;">If you received this email, your email automation is working correctly!</p>
      </body>
    </html>
    `
  );
  
  console.log("✅ SUCCESS! Test email sent successfully!");
  console.log(`📬 Check your inbox at: ${testEmail}`);
  console.log("\n💡 If you don't see the email:");
  console.log("   1. Check your spam/junk folder");
  console.log("   2. Verify sender email is verified in Brevo");
  console.log("   3. Check Brevo dashboard for delivery status");
  
} catch (error) {
  console.error("\n❌ FAILED to send email!");
  console.error("Error:", error.message);
  console.log("\n🔧 Troubleshooting steps:");
  console.log("   1. Verify BREVO_API_KEY is correct and active");
  console.log("   2. Verify SENDER_EMAIL is verified in Brevo dashboard");
  console.log("   3. Check Brevo account status and limits");
}

console.log();
