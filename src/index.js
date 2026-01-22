import "dotenv/config";
import dns from "dns/promises";
import { readStudents, readTeachers } from "./services/csvReader.js";
import { sendEmail, validateBrevoConfig } from "./services/emailService.js";
import { generateODEmail } from "./templates/emailTemplate.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const STUDENTS_CSV = join(__dirname, "..", "data", "students.csv");
const TEACHERS_CSV = join(__dirname, "..", "data", "teachers.csv");

// Configuration
const MAX_EMAIL_QUOTA = parseInt(process.env.MAX_EMAIL_QUOTA) || 300;
const RATE_LIMIT_MS = 200; // 200ms between sends
const APP_TIMEZONE = process.env.APP_TIMEZONE || "UTC";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

// Sleep utility
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Email format validation
function validateEmailFormat(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// MX Record validation
async function checkMXRecord(email) {
  try {
    const domain = email.split("@")[1];
    if (!domain) return false;
    
    const mxRecords = await dns.resolveMx(domain);
    return mxRecords && mxRecords.length > 0;
  } catch (error) {
    return false;
  }
}

// Generate diagnostic summary
function generateDiagnosticLog() {
  const diagnostics = {
    timestamp: new Date().toLocaleString("en-US", { timeZone: APP_TIMEZONE }),
    envVars: {},
    warnings: [],
    errors: []
  };

  // Check environment variables
  const requiredVars = ["BREVO_API_KEY", "SENDER_EMAIL", "ADMIN_EMAIL"];
  const optionalVars = ["GMAIL_USER", "GMAIL_APP_PASSWORD", "APP_TIMEZONE"];

  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      diagnostics.envVars[varName] = "✅ Set";
    } else {
      diagnostics.envVars[varName] = "❌ Missing";
      diagnostics.errors.push(`${varName} is not set`);
    }
  });

  optionalVars.forEach(varName => {
    if (process.env[varName]) {
      diagnostics.envVars[varName] = "✅ Set";
    } else {
      diagnostics.envVars[varName] = "⚠️ Not Set (Optional)";
    }
  });

  return diagnostics;
}

// Generate admin report HTML
function generateAdminReportHTML(diagnostics, deliveryResults, stats) {
  const successCount = deliveryResults.filter(r => r.status === "SUCCESS").length;
  const failureCount = deliveryResults.filter(r => r.status !== "SUCCESS").length;

  const envVarRows = Object.entries(diagnostics.envVars)
    .map(([key, value]) => `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">${key}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${value}</td>
      </tr>
    `).join("");

  const deliveryRows = deliveryResults.map(result => {
    const statusColor = result.status === "SUCCESS" ? "#10b981" : "#ef4444";
    const statusIcon = result.status === "SUCCESS" ? "✅" : "❌";
    
    return `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${result.section}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${result.teacherName}</td>
        <td style="border: 1px solid #ddd; padding: 8px; font-family: monospace; font-size: 12px;">${result.email}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center; color: ${statusColor}; font-weight: bold;">${statusIcon} ${result.status}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${result.reason}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${result.studentCount}</td>
      </tr>
    `;
  }).join("");

  const warningSection = diagnostics.warnings.length > 0 ? `
    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0;">
      <h3 style="margin: 0 0 10px 0; color: #92400e;">⚠️ Warnings</h3>
      <ul style="margin: 0; padding-left: 20px;">
        ${diagnostics.warnings.map(w => `<li>${w}</li>`).join("")}
      </ul>
    </div>
  ` : "";

  const errorSection = diagnostics.errors.length > 0 ? `
    <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 12px; margin: 20px 0;">
      <h3 style="margin: 0 0 10px 0; color: #991b1b;">❌ Errors</h3>
      <ul style="margin: 0; padding-left: 20px;">
        ${diagnostics.errors.map(e => `<li>${e}</li>`).join("")}
      </ul>
    </div>
  ` : "";

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Email Automation - Admin Report</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 900px; margin: 0 auto; padding: 20px;">
      
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #1e3a8a; padding-bottom: 20px;">
        <img src="https://raw.githubusercontent.com/Praveenkumaran-MK/Feat-Email-automation/main/data/cit_logo.png" alt="CIT Logo" style="max-width: 120px; height: auto;">
        <h1 style="margin: 10px 0; color: #1e3a8a;">Email Automation System</h1>
        <h2 style="margin: 5px 0; color: #64748b; font-weight: normal;">Daily Admin Report</h2>
        <p style="margin: 5px 0; color: #64748b;">${diagnostics.timestamp}</p>
      </div>

      ${errorSection}
      ${warningSection}

      <!-- Part A: Diagnostic Summary -->
      <div style="margin-bottom: 30px;">
        <h2 style="color: #1e3a8a; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">📊 Diagnostic Summary</h2>
        
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <h3 style="margin-top: 0; color: #475569;">System Overview</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="padding: 5px 0;"><strong>Total Students Today:</strong> ${stats.totalStudentsToday}</li>
            <li style="padding: 5px 0;"><strong>Active Sections:</strong> ${stats.activeSections.join(", ").toUpperCase()}</li>
            <li style="padding: 5px 0;"><strong>Missing Teachers:</strong> ${stats.missingTeachers.length > 0 ? stats.missingTeachers.join(", ").toUpperCase() : "None"}</li>
            <li style="padding: 5px 0;"><strong>Execution Time:</strong> ${stats.executionTime}</li>
          </ul>
        </div>

        <h3 style="color: #475569;">Environment Variables</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
          <thead>
            <tr style="background-color: #f1f5f9;">
              <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Variable</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${envVarRows}
          </tbody>
        </table>
      </div>

      <!-- Part B: Delivery Status -->
      <div style="margin-bottom: 30px;">
        <h2 style="color: #1e3a8a; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">📧 Delivery Status Report</h2>
        
        <div style="display: flex; gap: 20px; margin: 20px 0;">
          <div style="flex: 1; background-color: #d1fae5; padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 32px; font-weight: bold; color: #065f46;">${successCount}</div>
            <div style="color: #047857; font-weight: 500;">Successful</div>
          </div>
          <div style="flex: 1; background-color: #fee2e2; padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 32px; font-weight: bold; color: #991b1b;">${failureCount}</div>
            <div style="color: #dc2626; font-weight: 500;">Failed</div>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 14px;">
          <thead>
            <tr style="background-color: #1e3a8a; color: white;">
              <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">Section</th>
              <th style="border: 1px solid #ddd; padding: 10px;">Teacher Name</th>
              <th style="border: 1px solid #ddd; padding: 10px;">Email</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">Status</th>
              <th style="border: 1px solid #ddd; padding: 10px;">Reason</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">Students</th>
            </tr>
          </thead>
          <tbody>
            ${deliveryRows}
          </tbody>
        </table>
      </div>

      <!-- Footer -->
      <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e2e8f0; text-align: center; color: #64748b; font-size: 12px;">
        <p>Chennai Institute of Technology | Automated Email System</p>
        <p>This is an automated report. Please do not reply to this email.</p>
      </div>

    </body>
    </html>
  `;
}

// Main function
async function main() {
  const startTime = Date.now();

  console.log("\n" + "=".repeat(70));
  console.log("🚀 EMAIL AUTOMATION SYSTEM - PRODUCTION MODE");
  console.log("=".repeat(70));
  console.log(`📅 Started at: ${new Date().toLocaleString("en-US", { timeZone: APP_TIMEZONE })}`);
  console.log("=".repeat(70) + "\n");

  // ============================================================================
  // PHASE 1: SYSTEM DIAGNOSTICS
  // ============================================================================
  console.log("📋 PHASE 1: SYSTEM DIAGNOSTICS");
  console.log("-".repeat(70));

  const diagnostics = generateDiagnosticLog();

  console.log("\n🔧 Environment Variables:");
  Object.entries(diagnostics.envVars).forEach(([key, value]) => {
    console.log(`   ${key}: ${value}`);
  });

  // Validate Brevo configuration
  try {
    validateBrevoConfig();
    console.log("\n✅ Brevo configuration validated");
  } catch (error) {
    diagnostics.errors.push(`Brevo configuration error: ${error.message}`);
    console.error(`\n❌ Brevo configuration error: ${error.message}`);
  }

  // Check admin email
  if (!ADMIN_EMAIL) {
    diagnostics.errors.push("ADMIN_EMAIL is not set - cannot send admin report");
    console.error("❌ ADMIN_EMAIL is not set - admin report will not be sent");
  }

  // Load CSV data
  console.log("\n📂 Loading CSV data...");
  let students, teachers;
  
  try {
    students = readStudents(STUDENTS_CSV);
    console.log(`   ✅ Loaded ${students.length} students`);
  } catch (error) {
    diagnostics.errors.push(`Failed to load students.csv: ${error.message}`);
    console.error(`   ❌ Failed to load students.csv: ${error.message}`);
    students = [];
  }

  try {
    teachers = readTeachers(TEACHERS_CSV);
    console.log(`   ✅ Loaded ${teachers.length} teachers`);
  } catch (error) {
    diagnostics.errors.push(`Failed to load teachers.csv: ${error.message}`);
    console.error(`   ❌ Failed to load teachers.csv: ${error.message}`);
    teachers = [];
  }

  // Filter students for today
  const today = new Date().toLocaleDateString("en-CA", { timeZone: APP_TIMEZONE });
  const todaysStudents = students.filter(s => s.date === today);

  console.log(`\n📅 Date Check:`);
  console.log(`   Today's Date: ${today}`);
  console.log(`   Students with OD today: ${todaysStudents.length}`);

  if (todaysStudents.length === 0) {
    diagnostics.warnings.push("No students have OD today - no emails will be sent");
    console.log("   ⚠️ No students with OD today");
  }

  // Group students by section
  const studentsBySection = todaysStudents.reduce((acc, student) => {
    const section = student.section.toLowerCase();
    if (!acc[section]) acc[section] = [];
    acc[section].push(student);
    return acc;
  }, {});

  const activeSections = Object.keys(studentsBySection);
  console.log(`\n🗂️ Active Sections: ${activeSections.length > 0 ? activeSections.join(", ").toUpperCase() : "None"}`);

  // Check teacher mapping
  const missingTeachers = [];
  activeSections.forEach(section => {
    const teacher = teachers.find(t => t.section.toLowerCase() === section);
    if (!teacher) {
      missingTeachers.push(section);
      diagnostics.warnings.push(`No teacher assigned for section ${section.toUpperCase()}`);
      console.log(`   ⚠️ Missing teacher for section ${section.toUpperCase()}`);
    }
  });

  console.log("\n" + "=".repeat(70) + "\n");

  // ============================================================================
  // PHASE 2: EMAIL SENDING LOOP
  // ============================================================================
  console.log("📧 PHASE 2: EMAIL SENDING");
  console.log("-".repeat(70));

  const deliveryResults = [];
  let emailsSent = 0;

  for (const section of activeSections) {
    const teacher = teachers.find(t => t.section.toLowerCase() === section);
    
    if (!teacher) {
      deliveryResults.push({
        section: section.toUpperCase(),
        teacherName: "N/A",
        email: "N/A",
        status: "FAILED",
        reason: "No teacher assigned for this section",
        studentCount: studentsBySection[section].length
      });
      console.log(`❌ [Section ${section.toUpperCase()}] No teacher assigned`);
      continue;
    }

    const sectionStudents = studentsBySection[section];
    const result = {
      section: section.toUpperCase(),
      teacherName: teacher.name,
      email: teacher.email,
      status: "PENDING",
      reason: "",
      studentCount: sectionStudents.length
    };

    console.log(`\n[Section ${section.toUpperCase()}] Processing ${teacher.name} (${teacher.email})...`);

    // Step 1: Syntax Check
    if (!validateEmailFormat(teacher.email)) {
      result.status = "FAILED";
      result.reason = "Invalid email format";
      deliveryResults.push(result);
      console.log(`   ❌ FAILED: Invalid email format`);
      continue;
    }
    console.log(`   ✅ Syntax check passed`);

    // Step 2: MX Record Check
    const hasMXRecord = await checkMXRecord(teacher.email);
    if (!hasMXRecord) {
      const domain = teacher.email.split("@")[1];
      result.status = "FAILED";
      result.reason = `Domain '${domain}' not found (MX record lookup failed)`;
      deliveryResults.push(result);
      console.log(`   ❌ FAILED: Domain '${domain}' not found (no MX records)`);
      continue;
    }
    console.log(`   ✅ MX record check passed`);

    // Step 3: Quota Safety Check
    if (emailsSent >= MAX_EMAIL_QUOTA) {
      result.status = "FAILED";
      result.reason = `Email quota exceeded (${MAX_EMAIL_QUOTA} emails per run)`;
      deliveryResults.push(result);
      console.log(`   ❌ FAILED: Quota exceeded (${MAX_EMAIL_QUOTA} limit)`);
      continue;
    }

    // Step 4: Send Email via Brevo API
    try {
      const { subject, htmlContent } = generateODEmail(teacher, sectionStudents);
      await sendEmail(teacher.email, subject, htmlContent);
      
      result.status = "SUCCESS";
      result.reason = "Email sent successfully";
      deliveryResults.push(result);
      emailsSent++;
      
      console.log(`   ✅ SUCCESS: Email sent (${emailsSent}/${MAX_EMAIL_QUOTA})`);
      
      // Rate limiting
      await sleep(RATE_LIMIT_MS);
      
    } catch (error) {
      result.status = "FAILED";
      result.reason = `API Error: ${error.message}`;
      deliveryResults.push(result);
      console.log(`   ❌ FAILED: ${error.message}`);
    }
  }

  console.log("\n" + "=".repeat(70) + "\n");

  // ============================================================================
  // PHASE 3: ADMIN REPORT
  // ============================================================================
  console.log("📊 PHASE 3: GENERATING ADMIN REPORT");
  console.log("-".repeat(70));

  const endTime = Date.now();
  const executionTime = ((endTime - startTime) / 1000).toFixed(2) + "s";

  const stats = {
    totalStudentsToday: todaysStudents.length,
    activeSections,
    missingTeachers,
    executionTime
  };

  const adminReportHTML = generateAdminReportHTML(diagnostics, deliveryResults, stats);

  if (ADMIN_EMAIL) {
    try {
      const subject = `📊 Email Automation Report - ${today}`;
      await sendEmail(ADMIN_EMAIL, subject, adminReportHTML);
      console.log(`✅ Admin report sent to ${ADMIN_EMAIL}`);
    } catch (error) {
      console.error(`❌ Failed to send admin report: ${error.message}`);
    }
  } else {
    console.log("⚠️ ADMIN_EMAIL not set - skipping admin report");
  }

  // Final summary
  console.log("\n" + "=".repeat(70));
  console.log("📈 EXECUTION SUMMARY");
  console.log("=".repeat(70));
  console.log(`✅ Emails Sent: ${emailsSent}`);
  console.log(`❌ Failures: ${deliveryResults.filter(r => r.status !== "SUCCESS").length}`);
  console.log(`⏱️  Execution Time: ${executionTime}`);
  console.log("=".repeat(70) + "\n");

  process.exit(0);
}

// Run the main function
main().catch(error => {
  console.error("\n❌ FATAL ERROR:", error.message);
  console.error(error.stack);
  process.exit(1);
});
