import brevo from "@getbrevo/brevo";


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
 * @param {number} maxRetries 
 * @returns {Promise} 
 */
export async function sendEmailWithRetry(toEmail, subject, htmlContent, maxRetries = MAX_RETRIES) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await sendEmail(toEmail, subject, htmlContent);
      
      
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
 * @param {string} toEmail 
 * @param {string} subject 
 * @param {string} htmlContent
 */
export async function sendEmail(toEmail, subject, htmlContent) {
  const email = {
    sender: { email: process.env.SENDER_EMAIL },
    to: [{ email: toEmail }],
    subject,
    htmlContent,
  };

  try {
    const api = getApiInstance();
    await api.sendTransacEmail(email);
  } catch (err) {
    const errorMessage = err.response?.body?.message || err.message || 'Unknown error';
    throw new Error(`Email send failed: ${errorMessage}`);
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

