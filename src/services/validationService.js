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
 * Validate email address format
 */
function validateEmailFormat(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate CSV data
 */
export function validateCSVData() {
  const result = {
    passed: true,
    issues: [],
    students: { count: 0, valid: true },
    teachers: { count: 0, valid: true },
  };

  try {
    // Validate students CSV
    const students = readStudents(STUDENTS_CSV);
    result.students.count = students.length;

    if (students.length === 0) {
      result.passed = false;
      result.students.valid = false;
      result.issues.push("No students found in CSV");
    }

    // Check for duplicate student IDs
    const studentIds = students.map((s) => s.regno);
    const duplicateIds = studentIds.filter(
      (id, index) => studentIds.indexOf(id) !== index,
    );
    if (duplicateIds.length > 0) {
      result.passed = false;
      result.students.valid = false;
      result.issues.push(
        `Duplicate student IDs found: ${[...new Set(duplicateIds)].join(", ")}`,
      );
    }

    // Validate teachers CSV
    const teachers = readTeachers(TEACHERS_CSV);
    result.teachers.count = teachers.length;

    if (teachers.length === 0) {
      result.passed = false;
      result.teachers.valid = false;
      result.issues.push("No teachers found in CSV");
    }

    // Check for duplicate sections
    const sections = teachers.map((t) => t.section.toLowerCase());
    const duplicateSections = sections.filter(
      (sec, index) => sections.indexOf(sec) !== index,
    );
    if (duplicateSections.length > 0) {
      result.passed = false;
      result.teachers.valid = false;
      result.issues.push(
        `Duplicate teacher sections: ${[...new Set(duplicateSections)].join(", ").toUpperCase()}`,
      );
    }
  } catch (error) {
    result.passed = false;
    result.issues.push(`CSV read error: ${error.message}`);
  }

  return result;
}

/**
 * Check Brevo API status
 */
export async function checkBrevoStatus() {
  const result = {
    passed: true,
    connected: false,
    account: null,
    senderVerified: false,
    issues: [],
  };

  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.SENDER_EMAIL;

  if (!apiKey) {
    result.passed = false;
    result.issues.push("BREVO_API_KEY not set");
    return result;
  }

  if (!senderEmail) {
    result.passed = false;
    result.issues.push("SENDER_EMAIL not set");
    return result;
  }

  try {
    // Test API connection
    const apiInstance = new brevo.AccountApi();
    apiInstance.setApiKey(brevo.AccountApiApiKeys.apiKey, apiKey);

    const account = await apiInstance.getAccount();
    result.connected = true;
    result.account = {
      email: account.email,
      company: account.companyName || "N/A",
      plan: account.plan?.type || "N/A",
      credits:
        account.plan?.creditsType === "unlimited"
          ? "Unlimited"
          : account.plan?.credits || "N/A",
    };

    // Sender verification check skipped
  } catch (error) {
    result.passed = false;
    result.connected = false;

    if (
      error.message.includes("401") ||
      error.message.includes("Unauthorized")
    ) {
      result.issues.push("Invalid or expired Brevo API key");
    } else {
      result.issues.push(`Brevo API error: ${error.message}`);
    }
  }

  return result;
}

/**
 * Validate teacher emails - only check for critical errors
 */
export function validateTeacherEmails() {
  const result = {
    passed: true,
    invalidEmails: [],
    issues: [],
    warnings: [],
  };

  try {
    const teachers = readTeachers(TEACHERS_CSV);

    teachers.forEach((teacher) => {
      // Only check for obviously invalid emails (missing @, empty, etc.)
      // Don't do strict validation - Brevo will handle that
      if (!teacher.email || !teacher.email.includes("@")) {
        result.passed = false;
        result.invalidEmails.push({
          section: teacher.section.toUpperCase(),
          teacher: teacher.name,
          email: teacher.email || "(empty)",
        });
      }
    });

    if (result.invalidEmails.length > 0) {
      result.issues.push(
        `${result.invalidEmails.length} teacher(s) with obviously invalid email (missing @ or empty)`,
      );
    }
  } catch (error) {
    result.passed = false;
    result.issues.push(`Email validation error: ${error.message}`);
  }

  return result;
}

/**
 * Detect logical errors
 */
export function detectLogicalErrors() {
  const result = {
    passed: true,
    errors: [],
    missingSections: [],
    noStudentsToday: false,
  };

  try {
    const students = readStudents(STUDENTS_CSV);
    const teachers = readTeachers(TEACHERS_CSV);

    const timeZone = process.env.APP_TIMEZONE || "UTC";
    const today = new Date().toLocaleDateString("en-CA", { timeZone });
    const todaysStudents = students.filter((s) => s.date === today);

    // Check if there are students for today
    if (todaysStudents.length === 0) {
      result.noStudentsToday = true;
      result.errors.push(`No students scheduled for today (${today})`);
      // This is not a failure - just informational
    }

    // Group students by section
    const studentsBySection = todaysStudents.reduce((acc, student) => {
      const section = student.section.toLowerCase();
      if (!acc[section]) acc[section] = [];
      acc[section].push(student);
      return acc;
    }, {});

    // Check if every section has a teacher
    const teacherSections = new Set(
      teachers.map((t) => t.section.toLowerCase()),
    );

    Object.keys(studentsBySection).forEach((section) => {
      if (!teacherSections.has(section)) {
        result.passed = false;
        result.missingSections.push({
          section: section.toUpperCase(),
          studentCount: studentsBySection[section].length,
        });
      }
    });

    if (result.missingSections.length > 0) {
      result.errors.push(
        `${result.missingSections.length} section(s) with students but no teacher assigned`,
      );
    }
  } catch (error) {
    result.passed = false;
    result.errors.push(`Logical validation error: ${error.message}`);
  }

  return result;
}

/**
 * Run all pre-flight checks
 */
export async function runPreFlightChecks() {
  console.log("\n🔍 Running Pre-Flight Validation Checks...\n");

  const results = {
    passed: true,
    checks: {},
    summary: "",
    totalIssues: 0,
  };

  // 1. CSV Validation
  console.log("📂 Validating CSV data...");
  results.checks.csvValidation = validateCSVData();
  if (!results.checks.csvValidation.passed) {
    results.passed = false;
    results.totalIssues += results.checks.csvValidation.issues.length;
    console.log(
      `   ❌ Failed: ${results.checks.csvValidation.issues.length} issue(s)`,
    );
  } else {
    console.log(
      `   ✅ Passed (${results.checks.csvValidation.students.count} students, ${results.checks.csvValidation.teachers.count} teachers)`,
    );
  }

  // 2. Brevo API Check
  console.log("📡 Checking Brevo API status...");
  results.checks.brevoStatus = await checkBrevoStatus();
  if (!results.checks.brevoStatus.passed) {
    results.passed = false;
    results.totalIssues += results.checks.brevoStatus.issues.length;
    console.log(
      `   ❌ Failed: ${results.checks.brevoStatus.issues.length} issue(s)`,
    );
  } else {
    console.log(
      `   ✅ Connected (${results.checks.brevoStatus.account?.email})`,
    );
  }

  // 3. Email Validation (only critical errors)
  console.log("📧 Checking for critical email errors...");
  results.checks.emailValidation = validateTeacherEmails();
  if (!results.checks.emailValidation.passed) {
    results.passed = false;
    results.totalIssues += results.checks.emailValidation.invalidEmails.length;
    console.log(
      `   ❌ Failed: ${results.checks.emailValidation.invalidEmails.length} critical error(s)`,
    );
  } else {
    console.log("   ✅ No critical email errors (missing @ or empty)");
  }

  // 4. Logical Errors
  console.log("🔍 Checking for logical errors...");
  results.checks.logicalErrors = detectLogicalErrors();
  if (!results.checks.logicalErrors.passed) {
    results.passed = false;
    results.totalIssues += results.checks.logicalErrors.errors.length;
    console.log(
      `   ❌ Failed: ${results.checks.logicalErrors.errors.length} error(s)`,
    );
  } else if (results.checks.logicalErrors.noStudentsToday) {
    console.log("   ℹ️  No students scheduled for today");
  } else {
    console.log("   ✅ No issues found");
  }

  // Generate summary
  if (results.passed) {
    results.summary = "All pre-flight checks passed";
    console.log("\n✅ All Pre-Flight Checks Passed!\n");
  } else {
    results.summary = `${results.totalIssues} issue(s) found`;
    console.log(
      `\n❌ Pre-Flight Checks Failed: ${results.totalIssues} issue(s) found\n`,
    );
  }

  return results;
}
