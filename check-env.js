import "dotenv/config";
console.log("BREVO_API_KEY exists:", !!process.env.BREVO_API_KEY);
console.log("SENDER_EMAIL exists:", !!process.env.SENDER_EMAIL);
console.log("GMAIL_USER exists:", !!process.env.GMAIL_USER);
