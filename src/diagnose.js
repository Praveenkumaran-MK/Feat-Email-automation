import "dotenv/config";
import { readStudents, readTeachers } from "./services/csvReader.js";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const STUDENTS_CSV = join(__dirname, '..', 'data', 'students.csv');
const TEACHERS_CSV = join(__dirname, '..', 'data', 'teachers.csv');

console.log("\n" + "=".repeat(70));
console.log("🔍 EMAIL AUTOMATION DIAGNOSTIC TOOL");
console.log("=".repeat(70) + "\n");

// 1. Check Environment Variables
console.log("📋 ENVIRONMENT VARIABLES:");
console.log("─".repeat(70));
console.log(`BREVO_API_KEY: ${process.env.BREVO_API_KEY ? '✅ Set (' + process.env.BREVO_API_KEY.substring(0, 20) + '...)' : '❌ NOT SET'}`);
console.log(`SENDER_EMAIL: ${process.env.SENDER_EMAIL || '❌ NOT SET'}`);
console.log(`APP_TIMEZONE: ${process.env.APP_TIMEZONE || 'UTC (default)'}`);
console.log(`SEND_TIME: ${process.env.SEND_TIME || '07:00 (default)'}`);
console.log(`GMAIL_USER: ${process.env.GMAIL_USER ? '✅ Set' : '⚠️  Not set (optional)'}`);
console.log(`ADMIN_EMAIL: ${process.env.ADMIN_EMAIL || '⚠️  Not set (optional)'}`);
console.log();

// 2. Check Timezone and Date
const timeZone = process.env.APP_TIMEZONE || 'UTC';
const now = new Date();
const localDate = now.toLocaleDateString('en-CA', { timeZone }); // YYYY-MM-DD
const localTime = now.toLocaleTimeString('en-US', { timeZone, hour12: false });
const utcDate = now.toLocaleDateString('en-CA', { timeZone: 'UTC' });

console.log("🕐 DATE & TIME INFORMATION:");
console.log("─".repeat(70));
console.log(`Current Timezone: ${timeZone}`);
console.log(`Local Date (${timeZone}): ${localDate}`);
console.log(`Local Time (${timeZone}): ${localTime}`);
console.log(`UTC Date: ${utcDate}`);
console.log(`UTC Time: ${now.toISOString()}`);
console.log();

// 3. Check CSV Data
console.log("📂 CSV DATA ANALYSIS:");
console.log("─".repeat(70));

try {
  const students = readStudents(STUDENTS_CSV);
  const teachers = readTeachers(TEACHERS_CSV);
  
  console.log(`Total Students: ${students.length}`);
  console.log(`Total Teachers: ${teachers.length}`);
  console.log();
  
  // Show all student dates
  console.log("📅 STUDENT DATES IN CSV:");
  const dateCount = {};
  students.forEach(s => {
    dateCount[s.date] = (dateCount[s.date] || 0) + 1;
  });
  
  Object.entries(dateCount).forEach(([date, count]) => {
    const isToday = date === localDate;
    const marker = isToday ? '👉 TODAY' : '';
    console.log(`   ${date}: ${count} student(s) ${marker}`);
  });
  console.log();
  
  // Filter for today
  const todaysStudents = students.filter(s => s.date === localDate);
  
  console.log("📧 EMAILS THAT WOULD BE SENT TODAY:");
  console.log("─".repeat(70));
  
  if (todaysStudents.length === 0) {
    console.log("❌ NO STUDENTS FOUND FOR TODAY'S DATE!");
    console.log(`   Expected date: ${localDate}`);
    console.log(`   Available dates: ${Object.keys(dateCount).join(', ')}`);
    console.log();
    console.log("💡 SOLUTION: Update students.csv with today's date to send emails.");
  } else {
    console.log(`✅ Found ${todaysStudents.length} student(s) for today (${localDate})\n`);
    
    // Group by section
    const studentsBySection = todaysStudents.reduce((acc, student) => {
      const section = student.section.toLowerCase();
      if (!acc[section]) acc[section] = [];
      acc[section].push(student);
      return acc;
    }, {});
    
    Object.entries(studentsBySection).forEach(([section, sectionStudents]) => {
      const teacher = teachers.find(t => t.section.toLowerCase() === section);
      
      if (teacher) {
        console.log(`📨 Section ${section.toUpperCase()}:`);
        console.log(`   Teacher: ${teacher.name}`);
        console.log(`   Email: ${teacher.email}`);
        console.log(`   Students: ${sectionStudents.length}`);
        sectionStudents.forEach(s => {
          console.log(`      - ${s.name} (${s.regno}) - ${s.event}`);
        });
        console.log();
      } else {
        console.log(`⚠️  Section ${section.toUpperCase()}: NO TEACHER FOUND!`);
        console.log(`   Students: ${sectionStudents.length}`);
        console.log();
      }
    });
  }
  
} catch (error) {
  console.error("❌ ERROR reading CSV files:", error.message);
}

// 4. Check scheduled time
const targetTime = process.env.SEND_TIME || "07:00";
const [targetHour] = targetTime.split(':').map(Number);
const currentHour = parseInt(now.toLocaleTimeString('en-US', { 
  timeZone, 
  hour12: false, 
  hour: '2-digit' 
}), 10);

console.log("⏰ SCHEDULED TIME CHECK:");
console.log("─".repeat(70));
console.log(`Scheduled Time: ${targetTime}`);
console.log(`Current Hour: ${currentHour}:00`);
console.log(`Would send now: ✅ YES (time check is disabled in production)`);
console.log();

console.log("=".repeat(70));
console.log("🎯 DIAGNOSTIC SUMMARY");
console.log("=".repeat(70));

// Summary
const issues = [];
const warnings = [];

if (!process.env.BREVO_API_KEY) issues.push("BREVO_API_KEY not set");
if (!process.env.SENDER_EMAIL) issues.push("SENDER_EMAIL not set");

try {
  const students = readStudents(STUDENTS_CSV);
  const todaysStudents = students.filter(s => s.date === localDate);
  if (todaysStudents.length === 0) {
    issues.push(`No students scheduled for today (${localDate})`);
  }
} catch (e) {
  issues.push("Cannot read CSV files");
}

if (!process.env.GMAIL_USER || !process.env.ADMIN_EMAIL) {
  warnings.push("Gmail notifications not configured (optional)");
}

if (issues.length > 0) {
  console.log("\n❌ CRITICAL ISSUES:");
  issues.forEach(issue => console.log(`   • ${issue}`));
}

if (warnings.length > 0) {
  console.log("\n⚠️  WARNINGS:");
  warnings.forEach(warning => console.log(`   • ${warning}`));
}

if (issues.length === 0) {
  console.log("\n✅ ALL CHECKS PASSED! Emails should be sent successfully.");
}

console.log("\n" + "=".repeat(70) + "\n");
