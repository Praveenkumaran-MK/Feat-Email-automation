import "dotenv/config";
import brevo from "@getbrevo/brevo";
import { readStudents, readTeachers } from "./csvReader.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const STUDENTS_CSV = join(__dirname, "..", "..", "data", "students.csv");
const TEACHERS_CSV = join(__dirname, "..", "..", "data", "teachers.csv");

/**
 * Collect comprehensive diagnostic information
 * @returns {Promise<Object>} Diagnostic data
 */
export async function collectDiagnostics() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: {},
    brevoStatus: {},
    csvData: {},
    issues: [],
    warnings: [],
  };

  // 1. Environment Variables
  diagnostics.environment = {
    brevoApiKey: process.env.BREVO_API_KEY
      ? {
          set: true,
          preview: process.env.BREVO_API_KEY.substring(0, 20) + "...",
        }
      : { set: false },
    senderEmail: process.env.SENDER_EMAIL || null,
    timezone: process.env.APP_TIMEZONE || "UTC",
    sendTime: process.env.SEND_TIME || "07:00",
    gmailUser: process.env.GMAIL_USER ? "Set" : "Not set",
    adminEmail: process.env.ADMIN_EMAIL || "Not set",
    rateLimitDelay: process.env.RATE_LIMIT_DELAY_MS || "2000",
    maxEmailsPerDay: process.env.MAX_EMAILS_PER_DAY || "200",
  };

  // Check for missing critical env vars
  if (!process.env.BREVO_API_KEY) {
    diagnostics.issues.push("BREVO_API_KEY not set");
  }
  if (!process.env.SENDER_EMAIL) {
    diagnostics.issues.push("SENDER_EMAIL not set");
  }

  // 2. Brevo API Status
  try {
    const apiKey = process.env.BREVO_API_KEY;
    if (apiKey) {
      const apiInstance = new brevo.AccountApi();
      apiInstance.setApiKey(brevo.AccountApiApiKeys.apiKey, apiKey);

      const account = await apiInstance.getAccount();

      diagnostics.brevoStatus = {
        connected: true,
        email: account.email,
        company: account.companyName || "N/A",
        plan: account.plan?.type || "N/A",
        credits:
          account.plan?.creditsType === "unlimited"
            ? "Unlimited"
            : account.plan?.credits || "N/A",
      };

      // Sender verification check skipped
    }
  } catch (error) {
    diagnostics.brevoStatus = {
      connected: false,
      error: error.message,
    };

    if (
      error.message.includes("401") ||
      error.message.includes("Unauthorized")
    ) {
      diagnostics.issues.push("Invalid or expired Brevo API key");
    } else {
      diagnostics.issues.push(`Brevo API error: ${error.message}`);
    }
  }

  // 3. CSV Data Analysis
  try {
    const students = readStudents(STUDENTS_CSV);
    const teachers = readTeachers(TEACHERS_CSV);

    const timeZone = process.env.APP_TIMEZONE || "UTC";
    const today = new Date().toLocaleDateString("en-CA", { timeZone });
    const todaysStudents = students.filter((s) => s.date === today);

    // Count students by date
    const dateCount = {};
    students.forEach((s) => {
      dateCount[s.date] = (dateCount[s.date] || 0) + 1;
    });

    diagnostics.csvData = {
      totalStudents: students.length,
      totalTeachers: teachers.length,
      todayDate: today,
      studentsToday: todaysStudents.length,
      dateDistribution: dateCount,
      sections: {},
    };

    // Group by section for today
    if (todaysStudents.length > 0) {
      const studentsBySection = todaysStudents.reduce((acc, student) => {
        const section = student.section.toLowerCase();
        if (!acc[section]) acc[section] = [];
        acc[section].push(student);
        return acc;
      }, {});

      Object.entries(studentsBySection).forEach(
        ([section, sectionStudents]) => {
          const teacher = teachers.find(
            (t) => t.section.toLowerCase() === section,
          );
          diagnostics.csvData.sections[section.toUpperCase()] = {
            teacher: teacher
              ? { name: teacher.name, email: teacher.email }
              : null,
            studentCount: sectionStudents.length,
          };

          if (!teacher) {
            diagnostics.warnings.push(
              `No teacher found for section ${section.toUpperCase()}`,
            );
          }
        },
      );
    } else {
      diagnostics.warnings.push(`No students scheduled for today (${today})`);
    }
  } catch (error) {
    diagnostics.csvData = {
      error: error.message,
    };
    diagnostics.issues.push(`CSV read error: ${error.message}`);
  }

  // 4. Time Information
  const timeZone = process.env.APP_TIMEZONE || "UTC";
  const now = new Date();
  diagnostics.timeInfo = {
    timezone: timeZone,
    localDate: now.toLocaleDateString("en-CA", { timeZone }),
    localTime: now.toLocaleTimeString("en-US", { timeZone, hour12: false }),
    utcTime: now.toISOString(),
    scheduledTime: process.env.SEND_TIME || "07:00",
  };

  return diagnostics;
}

/**
 * Generate HTML for diagnostic information
 * @param {Object} diagnostics - Diagnostic data
 * @returns {string} HTML content
 */
export function generateDiagnosticHTML(diagnostics) {
  return `
    <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; padding: 15px; margin-top: 20px; border-radius: 5px;">
      <h3 style="color: #2c3e50; margin-top: 0;">🔍 System Diagnostics</h3>
      
      <!-- Brevo API Status -->
      <div style="margin-bottom: 15px;">
        <h4 style="color: #495057; margin-bottom: 8px;">📡 Brevo API Status</h4>
        <div style="background-color: white; padding: 10px; border-radius: 3px;">
          ${
            diagnostics.brevoStatus.connected
              ? `
            <div style="color: #28a745; margin-bottom: 5px;">✅ Connected</div>
            <div style="font-size: 14px; color: #6c757d;">
              <strong>Account:</strong> ${diagnostics.brevoStatus.email}<br>
              <strong>Plan:</strong> ${diagnostics.brevoStatus.plan}<br>
              <strong>Credits:</strong> ${diagnostics.brevoStatus.credits}
            </div>
            ${
              diagnostics.brevoStatus.verifiedSenders &&
              diagnostics.brevoStatus.verifiedSenders.length > 0
                ? `
              <div style="margin-top: 8px; font-size: 14px;">
                <strong>Verified Senders:</strong>
                <ul style="margin: 5px 0; padding-left: 20px;">
                  ${diagnostics.brevoStatus.verifiedSenders
                    .map(
                      (s) => `
                    <li>${s.verified ? "✅" : "⚠️"} ${s.email} ${s.isActive ? "(Active)" : ""}</li>
                  `,
                    )
                    .join("")}
                </ul>
              </div>
            `
                : ""
            }
          `
              : `
            <div style="color: #dc3545;">❌ Not Connected</div>
            <div style="font-size: 14px; color: #6c757d; margin-top: 5px;">
              <strong>Error:</strong> ${diagnostics.brevoStatus.error || "Unknown"}
            </div>
          `
          }
        </div>
      </div>

      <!-- Environment Variables -->
      <div style="margin-bottom: 15px;">
        <h4 style="color: #495057; margin-bottom: 8px;">⚙️ Environment Configuration</h4>
        <div style="background-color: white; padding: 10px; border-radius: 3px; font-size: 14px;">
          <div style="margin-bottom: 3px;">
            <strong>API Key:</strong> ${diagnostics.environment.brevoApiKey.set ? "✅ Set" : "❌ Not Set"}
          </div>
          <div style="margin-bottom: 3px;">
            <strong>Sender Email:</strong> ${diagnostics.environment.senderEmail || "❌ Not Set"}
          </div>
          <div style="margin-bottom: 3px;">
            <strong>Timezone:</strong> ${diagnostics.environment.timezone}
          </div>
          <div style="margin-bottom: 3px;">
            <strong>Scheduled Time:</strong> ${diagnostics.environment.sendTime}
          </div>
          <div style="margin-bottom: 3px;">
            <strong>Rate Limit Delay:</strong> ${diagnostics.environment.rateLimitDelay}ms
          </div>
        </div>
      </div>

      <!-- CSV Data Status -->
      <div style="margin-bottom: 15px;">
        <h4 style="color: #495057; margin-bottom: 8px;">📂 CSV Data Status</h4>
        <div style="background-color: white; padding: 10px; border-radius: 3px; font-size: 14px;">
          ${
            diagnostics.csvData.error
              ? `
            <div style="color: #dc3545;">❌ Error: ${diagnostics.csvData.error}</div>
          `
              : `
            <div style="margin-bottom: 3px;">
              <strong>Total Students:</strong> ${diagnostics.csvData.totalStudents}
            </div>
            <div style="margin-bottom: 3px;">
              <strong>Total Teachers:</strong> ${diagnostics.csvData.totalTeachers}
            </div>
            <div style="margin-bottom: 3px;">
              <strong>Today's Date:</strong> ${diagnostics.csvData.todayDate}
            </div>
            <div style="margin-bottom: 3px;">
              <strong>Students Today:</strong> ${diagnostics.csvData.studentsToday}
            </div>
            ${
              Object.keys(diagnostics.csvData.sections || {}).length > 0
                ? `
              <div style="margin-top: 8px;">
                <strong>Sections Today:</strong>
                <ul style="margin: 5px 0; padding-left: 20px;">
                  ${Object.entries(diagnostics.csvData.sections)
                    .map(
                      ([section, data]) => `
                    <li>${section}: ${data.studentCount} students - ${data.teacher ? `${data.teacher.name} (${data.teacher.email})` : "⚠️ No teacher"}</li>
                  `,
                    )
                    .join("")}
                </ul>
              </div>
            `
                : ""
            }
          `
          }
        </div>
      </div>

      <!-- Issues & Warnings -->
      ${
        diagnostics.issues.length > 0 || diagnostics.warnings.length > 0
          ? `
        <div>
          ${
            diagnostics.issues.length > 0
              ? `
            <div style="background-color: #f8d7da; border: 1px solid #dc3545; padding: 10px; border-radius: 3px; margin-bottom: 10px;">
              <strong style="color: #721c24;">❌ Critical Issues:</strong>
              <ul style="margin: 5px 0; padding-left: 20px; color: #721c24;">
                ${diagnostics.issues.map((issue) => `<li>${issue}</li>`).join("")}
              </ul>
            </div>
          `
              : ""
          }
          ${
            diagnostics.warnings.length > 0
              ? `
            <div style="background-color: #fff3cd; border: 1px solid #ffc107; padding: 10px; border-radius: 3px;">
              <strong style="color: #856404;">⚠️ Warnings:</strong>
              <ul style="margin: 5px 0; padding-left: 20px; color: #856404;">
                ${diagnostics.warnings.map((warning) => `<li>${warning}</li>`).join("")}
              </ul>
            </div>
          `
              : ""
          }
        </div>
      `
          : `
        <div style="background-color: #d4edda; border: 1px solid #28a745; padding: 10px; border-radius: 3px; color: #155724;">
          ✅ No issues detected
        </div>
      `
      }
    </div>
  `;
}
