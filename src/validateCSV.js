import { readSubscribers } from "./services/csvReader.js";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CSV_FILE_PATH = join(__dirname, '..', 'data', 'subscribers.csv');

console.log("\n" + "=".repeat(70));
console.log("🔍 CSV VALIDATION TOOL");
console.log("=".repeat(70));
console.log(`📂 File: ${CSV_FILE_PATH}\n`);

try {
  const subscribers = readSubscribers(CSV_FILE_PATH);
  
  console.log("\n" + "=".repeat(70));
  console.log("✅ VALIDATION SUCCESSFUL");
  console.log("=".repeat(70));
  console.log(`Total Valid Subscribers: ${subscribers.length}`);
  console.log("=".repeat(70) + "\n");
  
  // Show sample of first 5 subscribers
  if (subscribers.length > 0) {
    console.log("📋 Sample Subscribers (first 5):\n");
    subscribers.slice(0, 5).forEach((sub, index) => {
      console.log(`${index + 1}. ${sub.name} (${sub.email})`);
      console.log(`   Department: ${sub.department} | Preference: ${sub.preferences}`);
    });
    console.log("");
  }
  
  process.exit(0);
  
} catch (error) {
  console.error("\n" + "=".repeat(70));
  console.error("❌ VALIDATION FAILED");
  console.error("=".repeat(70));
  console.error(`Error: ${error.message}`);
  console.error("=".repeat(70) + "\n");
  process.exit(1);
}
