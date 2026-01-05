import brevo from "@getbrevo/brevo";

const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

// Rate limiting configuration
const RATE_LIMIT_DELAY = parseInt(process.env.RATE_LIMIT_DELAY_MS) || 2000; // 2 seconds default
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

/**
 * Delay helper for rate limiting
 * @param {number} ms - Milliseconds to delay
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Send email with retry logic and rate limiting
 * @param {string} toEmail - Recipient email
 * @param {string} subject - Email subject
 * @param {string} htmlContent - Email HTML content
 * @param {number} maxRetries - Maximum retry attempts
 * @returns {Promise} Send result
 */
export async function sendEmailWithRetry(toEmail, subject, htmlContent, maxRetries = MAX_RETRIES) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await sendEmail(toEmail, subject, htmlContent);
      
      // Rate limiting - wait before next email
      if (RATE_LIMIT_DELAY > 0) {
        await delay(RATE_LIMIT_DELAY);
      }
      
      return { success: true };
      
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain errors
      if (error.message.includes('401') || error.message.includes('Invalid API key')) {
        throw error; // Fatal error, don't retry
      }
      
      if (attempt < maxRetries) {
        // Exponential backoff
        const retryDelay = INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1);
        console.log(`   ⚠️  Retry ${attempt}/${maxRetries} after ${retryDelay}ms...`);
        await delay(retryDelay);
      }
    }
  }
  
  // All retries failed
  throw lastError;
}

/**
 * Send single email via Brevo API
 * @param {string} toEmail - Recipient email
 * @param {string} subject - Email subject
 * @param {string} htmlContent - Email HTML content
 */
export async function sendEmail(toEmail, subject, htmlContent) {
  const email = {
    sender: { email: process.env.SENDER_EMAIL },
    to: [{ email: toEmail }],
    subject,
    htmlContent,
  };

  try {
    await apiInstance.sendTransacEmail(email);
  } catch (err) {
    const errorMessage = err.response?.body?.message || err.message || 'Unknown error';
    throw new Error(`Email send failed: ${errorMessage}`);
  }
}

/**
 * Validate Brevo API configuration
 * @returns {boolean} True if configured correctly
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

