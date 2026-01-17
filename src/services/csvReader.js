import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';
import validator from 'validator';

/**
 * @param {string} filePath 
 * @returns {Array}
 */
export function readStudents(filePath) {
  try {
    const fileContent = readFileSync(filePath, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const validStudents = [];
    const errors = [];

    records.forEach((record, index) => {
      const validation = validateStudent(record, index + 2);
      if (validation.valid) {
        validStudents.push(validation.student);
      } else {
        errors.push(validation.error);
      }
    });

    console.log(`\n📊 Student CSV Validation Results:`);
    console.log(`   ✅ Valid students: ${validStudents.length}`);
    if (errors.length > 0) {
      console.log(`   ⚠️  Invalid records: ${errors.length}`);
      errors.forEach(error => console.log(`      - ${error}`));
    }

    return validStudents;
  } catch (error) {
    console.error('❌ Error reading students CSV file:', error.message);
    throw new Error(`Failed to read students CSV file: ${error.message}`);
  }
}

/**
 * @param {string} filePath 
 * @returns {Array}
 */
export function readTeachers(filePath) {
  try {
    const fileContent = readFileSync(filePath, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const validTeachers = [];
    const errors = [];

    records.forEach((record, index) => {
      const validation = validateTeacher(record, index + 2);
      if (validation.valid) {
        validTeachers.push(validation.teacher);
      } else {
        errors.push(validation.error);
      }
    });

    console.log(`\n👨‍🏫 Teacher CSV Validation Results:`);
    console.log(`   ✅ Valid teachers: ${validTeachers.length}`);
    if (errors.length > 0) {
      console.log(`   ⚠️  Invalid records: ${errors.length}`);
      errors.forEach(error => console.log(`      - ${error}`));
    }

    return validTeachers;
  } catch (error) {
    console.error('❌ Error reading teachers CSV file:', error.message);
    throw new Error(`Failed to read teachers CSV file: ${error.message}`);
  }
}

/**
 * @param {Object} record 
 * @param {number} lineNumber 
 */
export function validateStudent(record, lineNumber) {
  const errors = [];
  
  if (!record.name) errors.push(`Line ${lineNumber}: Missing name`);
  if (!record.emailid || !validateEmail(record.emailid)) errors.push(`Line ${lineNumber}: Invalid emailid (${record.emailid})`);
  
  // regno[format is 24CSXXX]
  const regnoRegex = /^24CS\d{3}$/i;
  if (!record.regno || !regnoRegex.test(record.regno)) {
    errors.push(`Line ${lineNumber}: Invalid regno format (${record.regno}). Should be 24CSXXX`);
  }

  // section[a-o]
  const sectionRegex = /^[a-o]$/i;
  if (!record.section || !sectionRegex.test(record.section)) {
    errors.push(`Line ${lineNumber}: Invalid section (${record.section}). Should be a-o`);
  }

  if (errors.length > 0) return { valid: false, error: errors.join(', ') };

  return {
    valid: true,
    student: {
      name: record.name.trim(),
      emailid: record.emailid.trim().toLowerCase(),
      regno: record.regno.trim().toUpperCase(),
      section: record.section.trim().toLowerCase(),
      event: record.event || 'N/A',
      date: record.date || new Date().toISOString().split('T')[0]
    }
  };
}

/**
 * @param {Object} record 
 * @param {number} lineNumber 
 */
export function validateTeacher(record, lineNumber) {
  const errors = [];
  
  if (!record.teacher_name) errors.push(`Line ${lineNumber}: Missing teacher name`);
  if (!record.emailid || !validateEmail(record.emailid)) errors.push(`Line ${lineNumber}: Invalid emailid (${record.emailid})`);
  
  const sectionRegex = /^[a-o]$/i;
  if (!record.section || !sectionRegex.test(record.section)) {
    errors.push(`Line ${lineNumber}: Invalid section (${record.section}). Should be a-o`);
  }

  if (errors.length > 0) return { valid: false, error: errors.join(', ') };

  return {
    valid: true,
    teacher: {
      section: record.section.trim().toLowerCase(),
      name: record.teacher_name.trim(),
      email: record.emailid.trim().toLowerCase()
    }
  };
}

/**
 *  @param {string} filePath 
 * @returns {Array}
 */
export function readSubscribers(filePath) {
  try {
    
    const fileContent = readFileSync(filePath, 'utf-8');
    
    
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    
    const validSubscribers = [];
    const errors = [];

    records.forEach((record, index) => {
      const validation = validateSubscriber(record, index + 2); 
      
      if (validation.valid) {
        validSubscribers.push(validation.subscriber);
      } else {
        errors.push(validation.error);
      }
    });

    
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
 * @param {string} email
 * @returns {boolean} 
 */
export function validateEmail(email) {
  return validator.isEmail(email);
}

/**
 * @param {Object} record 
 * @param {number} lineNumber 
 * @returns {Object} 
 */
export function validateSubscriber(record, lineNumber) {
  const errors = [];

  
  if (!record.name || record.name.trim() === '') {
    errors.push(`Line ${lineNumber}: Missing name`);
  }

  if (!record.email || record.email.trim() === '') {
    errors.push(`Line ${lineNumber}: Missing email`);
  } else if (!validateEmail(record.email)) {
    errors.push(`Line ${lineNumber}: Invalid email format (${record.email})`);
  }

  
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
 * @param {string} filePath 
 * @returns {number} 
 */
export function getSubscriberCount(filePath) {
  try {
    const subscribers = readSubscribers(filePath);
    return subscribers.length;
  } catch (error) {
    return 0;
  }
}
