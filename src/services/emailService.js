import brevo from "@getbrevo/brevo";

/**
 * Error categories for email sending failures
 */
export const ErrorCategory = {
  API_LIMIT_EXCEEDED: 'API_LIMIT_EXCEEDED',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMIT: 'RATE_LIMIT',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

/**
 * Classifies an error from Brevo API into a specific category
 * @param {Error} error - The error object from Brevo API
 * @returns {Object} - { category, message, details, httpStatus }
 */
export function classifyError(error) {
  const errorMessage = error.message?.toLowerCase() || '';
  const responseBody = error.response?.body;
  const httpStatus = error.response?.statusCode || error.statusCode;
  
  // Extract detailed error information
  const apiMessage = responseBody?.message || error.message || 'Unknown error';
  const apiCode = responseBody?.code;
  
  let category = ErrorCategory.UNKNOWN_ERROR;
  let details = {};
  
  // Authentication errors (401)
  if (httpStatus === 401 || errorMessage.includes('invalid api key') || errorMessage.includes('unauthorized')) {
    category = ErrorCategory.AUTHENTICATION_ERROR;
    details = {
      suggestion: 'Verify BREVO_API_KEY in GitHub secrets is correct and active',
      action: 'Check Brevo dashboard for API key status'
    };
  }
  // API limit exceeded (429 or quota messages)
  else if (httpStatus === 429 || 
           errorMessage.includes('limit') || 
           errorMessage.includes('quota') ||
           errorMessage.includes('exceeded') ||
           apiCode === 'daily_limit_reached' ||
           apiCode === 'monthly_limit_reached') {
    category = ErrorCategory.API_LIMIT_EXCEEDED;
    details = {
      suggestion: 'Daily or monthly email quota exceeded',
      action: 'Check Brevo dashboard for current usage and limits, upgrade plan if needed, or wait for quota reset'
    };
  }
  // Rate limiting (too many requests)
  else if (errorMessage.includes('rate limit') || errorMessage.includes('too many requests')) {
    category = ErrorCategory.RATE_LIMIT;
    details = {
      suggestion: 'Sending emails too quickly',
      action: 'Increase RATE_LIMIT_DELAY_MS environment variable'
    };
  }
  // Network errors
  else if (errorMessage.includes('network') || 
           errorMessage.includes('timeout') ||
           errorMessage.includes('econnrefused') ||
           errorMessage.includes('enotfound') ||
           errorMessage.includes('dns') ||
           error.code === 'ETIMEDOUT' ||
           error.code === 'ECONNREFUSED' ||
           error.code === 'ENOTFOUND') {
    category = ErrorCategory.NETWORK_ERROR;
    details = {
      suggestion: 'Network connectivity issue',
      action: 'Check internet connection, retry workflow, or check GitHub Actions network status'
    };
  }
  // Validation errors (invalid email, unverified sender, etc.)
  else if (errorMessage.includes('invalid') || 
           errorMessage.includes('validation') ||
           errorMessage.includes('not verified') ||
           errorMessage.includes('sender') ||
           httpStatus === 400) {
    category = ErrorCategory.VALIDATION_ERROR;
    details = {
      suggestion: 'Email validation or sender verification issue',
      action: 'Verify SENDER_EMAIL is confirmed in Brevo dashboard and recipient emails are valid'
    };
  }
  
  return {
    category,
    message: apiMessage,
    details,
    httpStatus: httpStatus || 'N/A',
    originalError: error.message
  };
}

let apiInstance = null;

function getApiInstance() {
  if (!apiInstance) {
    if (!process.env.BREVO_API_KEY) {
      throw new Error('BREVO_API_KEY environment variable is not set');
    }
    apiInstance = new brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(
      brevo.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY
    );
  }
  return apiInstance;
}


const RATE_LIMIT_DELAY = parseInt(process.env.RATE_LIMIT_DELAY_MS) || 2000; // 2 seconds default
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

/**
 * @param {number} ms 
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * @param {string} toEmail
 * @param {string} subject
 * @param {string} htmlContent
 * @param {Array} attachments
 * @param {number} maxRetries 
 * @returns {Promise} 
 */
export async function sendEmailWithRetry(toEmail, subject, htmlContent, attachments = [], maxRetries = MAX_RETRIES) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await sendEmail(toEmail, subject, htmlContent, attachments);
      
      
      if (RATE_LIMIT_DELAY > 0) {
        await delay(RATE_LIMIT_DELAY);
      }
      
      return { success: true };
      
    } catch (error) {
      lastError = error;
      
     
      if (error.message.includes('401') || error.message.includes('Invalid API key')) {
        throw error; 
      }
      
      if (attempt < maxRetries) {
        const retryDelay = INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1);
        console.log(`   ⚠️  Retry ${attempt}/${maxRetries} after ${retryDelay}ms...`);
        await delay(retryDelay);
      }
    }
  }
  
  
  throw lastError;
}

/**
 * Validate email address format
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if valid
 */
function validateEmailFormat(email) {
  // RFC 5322 compliant email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * @param {string} toEmail 
 * @param {string} subject 
 * @param {string} htmlContent
 * @param {Array} attachments
 */
export async function sendEmail(toEmail, subject, htmlContent, attachments = []) {
  // Only check for obviously invalid emails (empty or missing @)
  // Brevo will handle detailed validation - we can't validate 300+ emails individually
  if (!toEmail || !toEmail.includes('@')) {
    const validationError = new Error(`Email send failed: Invalid email address: ${toEmail || '(empty)'}`);
    validationError.classification = {
      category: ErrorCategory.VALIDATION_ERROR,
      message: `Invalid email address: ${toEmail || '(empty)'}`,
      details: {
        suggestion: 'Email address is empty or missing @',
        action: 'Verify email address in CSV file'
      },
      httpStatus: 'N/A',
      originalError: `Invalid email: ${toEmail || '(empty)'}`
    };
    validationError.category = ErrorCategory.VALIDATION_ERROR;
    validationError.httpStatus = 'N/A';
    validationError.details = validationError.classification.details;
    throw validationError;
  }

  const email = {
    sender: { email: process.env.SENDER_EMAIL },
    to: [{ email: toEmail }],
    subject,
    htmlContent,
  };

  if (attachments && attachments.length > 0) {
    email.attachment = attachments;
  }

  try {
    const api = getApiInstance();
    await api.sendTransacEmail(email);
  } catch (err) {
    // Classify the error and attach detailed information
    const classified = classifyError(err);
    const enhancedError = new Error(`Email send failed: ${classified.message}`);
    enhancedError.classification = classified;
    enhancedError.category = classified.category;
    enhancedError.httpStatus = classified.httpStatus;
    enhancedError.details = classified.details;
    throw enhancedError;
  }
}

/**
 * @returns {boolean}
 */
export function validateBrevoConfig() {
  if (!process.env.BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY environment variable is not set');
  }
  
  if (!process.env.SENDER_EMAIL) {
    throw new Error('SENDER_EMAIL environment variable is not set');
  }
  
  return true;
}

