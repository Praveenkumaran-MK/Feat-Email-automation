import "dotenv/config";
import { readStudents, readTeachers } from "./services/csvReader.js";
import { sendEmailWithRetry, validateBrevoConfig, sendEmail } from "./services/emailService.js";
import { generateODEmail } from "./templates/emailTemplate.js";
import { sendErrorNotification, sendDailySummary } from "./services/gmailNotifier.js";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const STUDENTS_CSV = join(__dirname, '..', 'data', 'students.csv');
const TEACHERS_CSV = join(__dirname, '..', 'data', 'teachers.csv');


const TEST_MODE = process.argv.includes('--test');

async function sendDailyEmails() {
  const startTime = Date.now();
  
  console.log("\n" + "=".repeat(70));
  console.log("🚀 OD TRACKING NOTIFICATION SYSTEM");
  console.log("=".repeat(70));
  console.log(`📅 Started at: ${new Date().toLocaleString()}`);
  console.log("=".repeat(70) + "\n");

  let successCount = 0;
  let failureCount = 0;
  const failedSections = [];

  try {
    validateBrevoConfig();
    
    console.log("📂 Loading data...");
    const students = readStudents(STUDENTS_CSV);
    const teachers = readTeachers(TEACHERS_CSV);

    if (!students.length) throw new Error("No student records found.");
    if (!teachers.length) throw new Error("No teacher records found.");

    // Filter students for today only
    const today = new Date().toISOString().split('T')[0];
    const todaysStudents = students.filter(s => s.date === today);
    
    console.log(`📅 Today's Date: ${today}`);
    console.log(`✅ Found ${todaysStudents.length} students with OD today.\n`);

    if (!todaysStudents.length) {
      console.log("ℹ️ No OD records for today. Skipping email process.");
      return;
    }

    // Group students by section
    const studentsBySection = todaysStudents.reduce((acc, student) => {
      const section = student.section.toLowerCase();
      if (!acc[section]) acc[section] = [];
      acc[section].push(student);
      return acc;
    }, {});

    const activeSections = Object.keys(studentsBySection);
    
    for (const section of activeSections) {
      const teacher = teachers.find(t => t.section.toLowerCase() === section);
      
      if (!teacher) {
        console.warn(`⚠️ Warning: No teacher found for section ${section.toUpperCase()}. Skipping.`);
        continue;
      }
      
      const sectionStudents = studentsBySection[section];
      const progress = `[Section ${section.toUpperCase()}]`;

      try {
        const { subject, htmlContent } = generateODEmail(teacher, sectionStudents);
        
        if (TEST_MODE) {
          console.log(`🧪 TEST MODE: Would send OD report to ${teacher.name} (${teacher.email}) for ${sectionStudents.length} students.`);
          successCount++;
          continue;
        }

        await sendEmailWithRetry(teacher.email, subject, htmlContent);
        
        successCount++;
        console.log(`✅ ${progress} Report sent to ${teacher.name} (${teacher.email})`);

      } catch (error) {
        failureCount++;
        failedSections.push({
          section: section.toUpperCase(),
          teacher: teacher.name,
          email: teacher.email,
          error: error.message
        });
        console.error(`❌ ${progress} Failed: ${error.message}`);
      }
    }

    const endTime = Date.now();
    const executionTime = ((endTime - startTime) / 1000).toFixed(2);

    console.log("\n" + "=".repeat(70));
    console.log("📊 EXECUTION SUMMARY" + (TEST_MODE ? " (DRY RUN)" : ""));
    console.log("=".repeat(70));
    console.log(`${TEST_MODE ? '🧪 Simulated' : '✅ Sent'} Reports:    ${successCount}`);
    console.log(`❌ Failed Sections: ${failureCount}`);
    console.log(`⏱️  Execution Time:  ${executionTime}s`);
    console.log("=".repeat(70));

    // Stats for Gmail notification
    const stats = {
      total: activeSections.length,
      success: successCount,
      failed: failureCount,
      executionTime: `${executionTime}s`,
      failedEmails: failedSections.map(f => ({ name: f.teacher, email: f.email, error: f.error }))
    };

    if (failureCount > 0) {
      await sendErrorNotification(new Error(`${failureCount} section report(s) failed`), { stats });
    } else if (!TEST_MODE) {
      await sendDailySummary(stats);
    }

    process.exit(failureCount > 0 ? 1 : 0);

  } catch (error) {
    console.error("\n❌ FATAL ERROR:", error.message);
    try {
      await sendErrorNotification(error);
    } catch (e) {}
    process.exit(1);
  }
}

sendDailyEmails();
