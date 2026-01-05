import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';
import validator from 'validator';

/**
 * Read and parse subscriber data from CSV file
 * @param {string} filePath - Path to CSV file
 * @returns {Array} Array of validated subscriber objects
 */
export function readSubscribers(filePath) {
  try {
    // Read CSV file
    const fileContent = readFileSync(filePath, 'utf-8');
    
    // Parse CSV with headers
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    // Validate and filter subscribers
    const validSubscribers = [];
    const errors = [];

    records.forEach((record, index) => {
      const validation = validateSubscriber(record, index + 2); // +2 for header and 0-index
      
      if (validation.valid) {
        validSubscribers.push(validation.subscriber);
      } else {
        errors.push(validation.error);
      }
    });

    // Log validation results
    console.log(`\n📊 CSV Validation Results:`);
    console.log(`   ✅ Valid subscribers: ${validSubscribers.length}`);
    
    if (errors.length > 0) {
      console.log(`   ⚠️  Invalid records: ${errors.length}`);
      errors.forEach(error => console.log(`      - ${error}`));
    }

    return validSubscribers;

  } catch (error) {
    console.error('❌ Error reading CSV file:', error.message);
    throw new Error(`Failed to read CSV file: ${error.message}`);
  }
}

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export function validateEmail(email) {
  return validator.isEmail(email);
}

/**
 * Validate subscriber record
 * @param {Object} record - CSV record
 * @param {number} lineNumber - Line number in CSV
 * @returns {Object} Validation result
 */
export function validateSubscriber(record, lineNumber) {
  const errors = [];

  // Check required fields
  if (!record.name || record.name.trim() === '') {
    errors.push(`Line ${lineNumber}: Missing name`);
  }

  if (!record.email || record.email.trim() === '') {
    errors.push(`Line ${lineNumber}: Missing email`);
  } else if (!validateEmail(record.email)) {
    errors.push(`Line ${lineNumber}: Invalid email format (${record.email})`);
  }

  // Return validation result
  if (errors.length > 0) {
    return {
      valid: false,
      error: errors.join(', ')
    };
  }

  return {
    valid: true,
    subscriber: {
      name: record.name.trim(),
      email: record.email.trim().toLowerCase(),
      subscribed_date: record.subscribed_date || new Date().toISOString().split('T')[0],
      department: record.department || 'General',
      preferences: record.preferences || 'general',
      custom_field_1: record.custom_field_1 || '',
      custom_field_2: record.custom_field_2 || '',
    }
  };
}

/**
 * Get subscriber count from CSV file
 * @param {string} filePath - Path to CSV file
 * @returns {number} Number of subscribers
 */
export function getSubscriberCount(filePath) {
  try {
    const subscribers = readSubscribers(filePath);
    return subscribers.length;
  } catch (error) {
    return 0;
  }
}
