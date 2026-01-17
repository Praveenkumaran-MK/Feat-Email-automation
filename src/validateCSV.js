import { readStudents, readTeachers } from "./services/csvReader.js";
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const STUDENTS_CSV = join(__dirname, '..', 'data', 'students.csv');
const TEACHERS_CSV = join(__dirname, '..', 'data', 'teachers.csv');

console.log("🔍 Validating CSV Files...");

try {
  console.log(`\n📂 Checking Students CSV: ${STUDENTS_CSV}`);
  const students = readStudents(STUDENTS_CSV);
  console.log(`✅ Successfully loaded ${students.length} students.`);

  console.log(`\n📂 Checking Teachers CSV: ${TEACHERS_CSV}`);
  const teachers = readTeachers(TEACHERS_CSV);
  console.log(`✅ Successfully loaded ${teachers.length} teachers.`);

  const studentSections = new Set(students.map(s => s.section.toLowerCase()));
  const teacherSections = new Set(teachers.map(t => t.section.toLowerCase()));

  console.log("\n📊 Section Coverage:");
  studentSections.forEach(section => {
    if (teacherSections.has(section)) {
      console.log(`   ✅ Section ${section.toUpperCase()}: Has teacher assigned.`);
    } else {
      console.log(`   ❌ Section ${section.toUpperCase()}: MISSING TEACHER!`);
    }
  });

  console.log("\n✨ Validation Complete.");
} catch (error) {
  console.error("\n❌ Validation Failed:", error.message);
  process.exit(1);
}
