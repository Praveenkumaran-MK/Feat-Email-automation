import dotenv from "dotenv";
import { readSubscribers } from "./services/csvReader.js";
import { sendEmailWithRetry, validateBrevoConfig } from "./services/emailService.js";
import { generateDailyEmail } from "./templates/emailTemplate.js";
import { sendErrorNotification, sendDailySummary } from "./services/gmailNotifier.js";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const CSV_FILE_PATH = join(__dirname, '..', 'data', 'subscribers.csv');
const TEST_MODE = process.argv.includes('--test');
const TEST_LIMIT = 5; // Send to first 5 subscribers in test mode

/**
 * Main email sending function
 */
async function sendDailyEmails() {
  const startTime = Date.now();
  
  console.log("\n" + "=".repeat(70));
  console.log("🚀 EMAIL AUTOMATION SYSTEM - PRODUCTION MODE");
  console.log("=".repeat(70));
  console.log(`📅 Started at: ${new Date().toLocaleString()}`);
  console.log(`🧪 Test Mode: ${TEST_MODE ? 'YES (first 5 subscribers only)' : 'NO (all subscribers)'}`);
  console.log("=".repeat(70) + "\n");

  let subscribers = [];
  let successCount = 0;
  let failureCount = 0;
  const failedEmails = [];

  try {
    // Step 1: Validate Brevo configuration
    console.log("🔧 Step 1: Validating Brevo API configuration...");
    validateBrevoConfig();
    console.log("✅ Brevo API configuration valid\n");

    // Step 2: Load subscribers from CSV
    console.log("📂 Step 2: Loading subscribers from CSV...");
    console.log(`   File: ${CSV_FILE_PATH}`);
    
    subscribers = readSubscribers(CSV_FILE_PATH);
    
    if (!subscribers || subscribers.length === 0) {
      throw new Error("No valid subscribers found in CSV file");
    }

    // Apply test mode limit
    if (TEST_MODE && subscribers.length > TEST_LIMIT) {
      console.log(`\n⚠️  TEST MODE: Limiting to first ${TEST_LIMIT} subscribers`);
      subscribers = subscribers.slice(0, TEST_LIMIT);
    }

    console.log(`✅ Loaded ${subscribers.length} valid subscriber(s)\n`);

    // Step 3: Send emails with rate limiting
    console.log("📧 Step 3: Sending personalized emails...");
    console.log(`   Rate Limit: ${process.env.RATE_LIMIT_DELAY_MS || 2000}ms between emails`);
    console.log(`   Estimated Time: ~${Math.ceil((subscribers.length * 2) / 60)} minutes\n`);

    for (let i = 0; i < subscribers.length; i++) {
      const subscriber = subscribers[i];
      const progress = `[${i + 1}/${subscribers.length}]`;

      try {
        // Generate personalized email
        const { subject, htmlContent } = generateDailyEmail(subscriber);

        // Send with retry logic
        await sendEmailWithRetry(subscriber.email, subject, htmlContent);

        successCount++;
        console.log(`✅ ${progress} Sent to ${subscriber.name} (${subscriber.email})`);

      } catch (error) {
        failureCount++;
        failedEmails.push({
          name: subscriber.name,
          email: subscriber.email,
          error: error.message
        });
        console.error(`❌ ${progress} Failed: ${subscriber.name} (${subscriber.email})`);
        console.error(`   Error: ${error.message}`);
      }
    }

    // Step 4: Calculate statistics
    const endTime = Date.now();
    const executionTime = ((endTime - startTime) / 1000).toFixed(2);
    const successRate = ((successCount / subscribers.length) * 100).toFixed(1);

    // Step 5: Display summary
    console.log("\n" + "=".repeat(70));
    console.log("📊 EXECUTION SUMMARY");
    console.log("=".repeat(70));
    console.log(`✅ Successful:     ${successCount}/${subscribers.length} (${successRate}%)`);
    console.log(`❌ Failed:         ${failureCount}/${subscribers.length}`);
    console.log(`⏱️  Execution Time: ${executionTime}s`);
    console.log(`📅 Completed at:   ${new Date().toLocaleString()}`);
    console.log("=".repeat(70));

    // Display failed emails if any
    if (failedEmails.length > 0) {
      console.log("\n⚠️  FAILED EMAILS:");
      failedEmails.forEach(({ name, email, error }) => {
        console.log(`   - ${name} (${email}): ${error}`);
      });
      console.log("");
    }

    // Step 6: Send notifications (if configured)
    const stats = {
      total: subscribers.length,
      success: successCount,
      failed: failureCount,
      executionTime: `${executionTime}s`,
      failedEmails: failedEmails
    };

    if (failureCount > 0) {
      // Send error notification for failures
      console.log("📧 Sending error notification to admin...");
      await sendErrorNotification(
        new Error(`${failureCount} email(s) failed to send`),
        { stats, failedEmails }
      );
    } else {
      // Send success summary
      console.log("📧 Sending daily summary to admin...");
      await sendDailySummary(stats);
    }

    // Step 7: Exit with appropriate code
    console.log("\n" + "=".repeat(70));
    if (failureCount > 0) {
      console.log("⚠️  Job completed with errors");
      console.log("=".repeat(70) + "\n");
      process.exit(1);
    } else {
      console.log("✅ Job completed successfully!");
      console.log("=".repeat(70) + "\n");
      process.exit(0);
    }

  } catch (error) {
    // Fatal error handling
    console.error("\n" + "=".repeat(70));
    console.error("❌ FATAL ERROR");
    console.error("=".repeat(70));
    console.error(`Error: ${error.message}`);
    console.error(`Stack: ${error.stack}`);
    console.error("=".repeat(70) + "\n");

    // Send error notification
    try {
      await sendErrorNotification(error, {
        stats: {
          total: subscribers.length,
          success: successCount,
          failed: failureCount
        },
        failedEmails
      });
    } catch (notificationError) {
      console.error("Failed to send error notification:", notificationError.message);
    }

    process.exit(1);
  }
}

// Run the email automation
sendDailyEmails();
