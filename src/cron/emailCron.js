import cron from "node-cron";
import dotenv from "dotenv";
import { sendEmail } from "../services/emailService.js";
import { convertToCron } from "./cronTime.js";

dotenv.config();

// ==================== MOCK DATA ====================
const mockRecipients = [
  {
    name: "John Doe",
    email: "mkpk3426@gmail.com",
    department: "Engineering",
  },
  {
    name: "Jane Smith",
    email: "praveenkumaranmk.cse2024@citchennai.net",
    department: "Marketing",
  },
  {
    name: "Michael Johnson",
    email: "connect.praveenkmk.dev@gmail.com",
    department: "Sales",
  },
  {
    name: "Emily Davis",
    email: "emily.davis@example.com",
    department: "Human Resources",
  },
  {
    name: "David Wilson",
    email: "david.wilson@example.com",
    department: "Finance",
  },
];
// ===================================================

// Get cron time from environment variable (default: 07:00)
const emailTime = process.env.CRON_EMAIL_TIME || "07:00";
const cronExpression = convertToCron(emailTime);

console.log(`📧 Email automation scheduled for ${emailTime} (cron: ${cronExpression})`);

// Schedule the daily email job
cron.schedule(cronExpression, async () => {
  console.log("\n🚀 Running daily email job at", new Date().toLocaleString());
  console.log(`📨 Sending emails to ${mockRecipients.length} recipients...\n`);

  let successCount = 0;
  let failureCount = 0;

  // Send emails to all mock recipients
  for (const recipient of mockRecipients) {
    try {
      const subject = "Daily Update - " + new Date().toLocaleDateString();
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Hello ${recipient.name}! 👋</h2>
          <p style="font-size: 16px; color: #34495e;">
            This is your daily automated email from the <strong>${recipient.department}</strong> department.
          </p>
          <div style="background-color: #ecf0f1; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #2980b9; margin-top: 0;">Daily Reminder</h3>
            <p style="color: #555;">
              ✅ Check your tasks for today<br>
              ✅ Review pending items<br>
              ✅ Update your progress
            </p>
          </div>
          <p style="color: #7f8c8d; font-size: 14px;">
            Sent on: ${new Date().toLocaleString()}<br>
            Department: ${recipient.department}
          </p>
        </div>
      `;

      await sendEmail(recipient.email, subject, htmlContent);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to send email to ${recipient.name} (${recipient.email}):`, error.message);
      failureCount++;
    }
  }

  console.log("\n📊 Email Job Summary:");
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${failureCount}`);
  console.log(`   📧 Total: ${mockRecipients.length}\n`);
});
