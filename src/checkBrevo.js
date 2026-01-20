import "dotenv/config";
import brevo from "@getbrevo/brevo";

console.log("\n🔍 CHECKING BREVO API STATUS\n");

const apiKey = process.env.BREVO_API_KEY;
const senderEmail = process.env.SENDER_EMAIL;

console.log("API Key:", apiKey ? `✅ ${apiKey.substring(0, 20)}...` : "❌ Missing");
console.log("Sender Email:", senderEmail || "❌ Missing");
console.log();

if (!apiKey) {
  console.error("❌ BREVO_API_KEY is not set!");
  process.exit(1);
}

try {
  // Test API connection
  const apiInstance = new brevo.AccountApi();
  apiInstance.setApiKey(brevo.AccountApiApiKeys.apiKey, apiKey);
  
  console.log("📡 Testing Brevo API connection...\n");
  
  const account = await apiInstance.getAccount();
  
  console.log("✅ API CONNECTION SUCCESSFUL!\n");
  console.log("Account Details:");
  console.log("─".repeat(50));
  console.log(`Email: ${account.email}`);
  console.log(`Company: ${account.companyName || 'N/A'}`);
  console.log(`Plan: ${account.plan?.type || 'N/A'}`);
  
  if (account.plan) {
    console.log(`\nEmail Credits:`);
    console.log(`  Daily Limit: ${account.plan.creditsType === 'unlimited' ? 'Unlimited' : account.plan.credits || 'N/A'}`);
  }
  
  // Check sender verification
  console.log("\n📧 Checking sender verification...\n");
  
  const sendersApi = new brevo.SendersApi();
  sendersApi.setApiKey(brevo.SendersApiApiKeys.apiKey, apiKey);
  
  try {
    const senders = await sendersApi.getSenders();
    
    console.log("Verified Senders:");
    console.log("─".repeat(50));
    
    if (senders.senders && senders.senders.length > 0) {
      senders.senders.forEach(sender => {
        const isActive = sender.email === senderEmail ? "👉 ACTIVE" : "";
        const status = sender.active ? "✅ Verified" : "⚠️  Not Verified";
        console.log(`${status} ${sender.email} ${isActive}`);
      });
      
      const activeSender = senders.senders.find(s => s.email === senderEmail);
      if (!activeSender) {
        console.log(`\n⚠️  WARNING: ${senderEmail} is NOT in verified senders list!`);
        console.log("   You need to verify this email in Brevo dashboard.");
      } else if (!activeSender.active) {
        console.log(`\n⚠️  WARNING: ${senderEmail} is NOT verified!`);
        console.log("   Check your email for verification link from Brevo.");
      } else {
        console.log(`\n✅ ${senderEmail} is verified and ready to send!`);
      }
    } else {
      console.log("⚠️  No verified senders found!");
    }
  } catch (err) {
    console.log("⚠️  Could not fetch sender list:", err.message);
  }
  
  console.log();
  
} catch (error) {
  console.error("\n❌ BREVO API ERROR!");
  console.error("Error:", error.message);
  
  if (error.message.includes('401') || error.message.includes('Unauthorized')) {
    console.log("\n🔧 Your API key is invalid or expired!");
    console.log("   1. Go to https://app.brevo.com/settings/keys/api");
    console.log("   2. Generate a new API key");
    console.log("   3. Update your .env file");
  }
  
  process.exit(1);
}
