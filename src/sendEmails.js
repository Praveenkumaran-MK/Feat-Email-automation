import dotenv from "dotenv";
import { sendEmail } from "./services/emailService.js";

dotenv.config();

// ==================== MOCK DATA ====================
const mockRecipients = [
  { name: "John Doe", email: "john.doe@example.com", department: "Engineering" },
  { name: "Jane Smith", email: "jane.smith@example.com", department: "Marketing" },
  { name: "Michael Johnson", email: "michael.johnson@example.com", department: "Sales" },
  { name: "Emily Davis", email: "emily.davis@example.com", department: "Human Resources" },
  { name: "David Wilson", email: "david.wilson@example.com", department: "Finance" },
  { name: "Sarah Brown", email: "sarah.brown@example.com", department: "Engineering" },
  { name: "James Taylor", email: "james.taylor@example.com", department: "Marketing" },
  { name: "Linda Anderson", email: "linda.anderson@example.com", department: "Sales" },
  { name: "Robert Thomas", email: "robert.thomas@example.com", department: "Engineering" },
  { name: "Patricia Jackson", email: "patricia.jackson@example.com", department: "Finance" },
  // Add more recipients here to reach 300
];
// ===================================================

async function sendDailyEmails() {
  console.log("\n🚀 Starting daily email job at", new Date().toLocaleString());
  console.log("=" .repeat(60));

  try {
    const recipients = mockRecipients;

    if (!recipients || recipients.length === 0) {
      console.log("⚠️  No recipients found in mock data");
      process.exit(0);
    }

    console.log(`✅ Found ${recipients.length} recipients\n`);

    // Send emails to all recipients
    let successCount = 0;
    let failureCount = 0;
    const failedEmails = [];

    for (const recipient of recipients) {
      const { email, name, department } = recipient;

      try {
        const subject = "Daily Update - " + new Date().toLocaleDateString();
        const htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">Hello ${name}! 👋</h2>
            <p style="font-size: 16px; color: #34495e;">
              This is your daily automated email from the <strong>${department}</strong> department.
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
              Department: ${department}
            </p>
          </div>
        `;

        await sendEmail(email, subject, htmlContent);
        successCount++;
        console.log(`✅ [${successCount}/${recipients.length}] Sent to ${name} (${email})`);
      } catch (error) {
        failureCount++;
        failedEmails.push({ name, email, error: error.message });
        console.error(`❌ [${successCount + failureCount}/${recipients.length}] Failed: ${name} (${email}) - ${error.message}`);
      }
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 Email Job Summary:");
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Failed: ${failureCount}`);
    console.log(`   📧 Total: ${recipients.length}`);
    
    if (failedEmails.length > 0) {
      console.log("\n⚠️  Failed emails:");
      failedEmails.forEach(({ name, email, error }) => {
        console.log(`   - ${name} (${email}): ${error}`);
      });
    }
    
    console.log("=".repeat(60));
    console.log("✅ Job completed successfully\n");

    // Exit with error code if any emails failed
    if (failureCount > 0) {
      process.exit(1);
    }

  } catch (error) {
    console.error("\n❌ Fatal error:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the email job
sendDailyEmails();
