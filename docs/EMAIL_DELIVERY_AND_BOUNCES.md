# Email Delivery and Bounce Detection

## Important: Understanding Email Delivery

### How Brevo API Works

**At Send Time:**
- ✅ Brevo API validates email FORMAT only (has @, has domain, etc.)
- ✅ Returns HTTP 200 (success) if format is valid
- ✅ Email is queued for delivery

**After Send Time:**
- ⏳ Brevo attempts actual delivery to the recipient's mail server
- ❌ If email doesn't exist or domain is invalid, email **bounces**
- 📊 Bounce information is available in Brevo dashboard (not in API response)

### Current System Behavior

**What We CAN Detect:**
- ✅ Invalid email format (missing @, no domain, etc.)
- ✅ API authentication errors
- ✅ API rate limits
- ✅ Network errors

**What We CANNOT Detect at Send-Time:**
- ❌ Non-existent email addresses (e.g., typos like "praveenkumaanmk@...")
- ❌ Full mailboxes
- ❌ Blocked/blacklisted emails
- ❌ Domain doesn't exist

These failures happen **after** the API returns success and are reported as "bounces" by Brevo.

---

## Example Scenario

### Invalid Email: `praveenkumaanmk.cse2024@citchennai.net`

**What Happens:**
1. ✅ System validates format → PASS (has @, has domain)
2. ✅ Brevo API accepts email → Returns HTTP 200
3. ✅ System logs "Email sent successfully"
4. ⏳ Brevo attempts delivery to `citchennai.net` mail server
5. ❌ Mail server rejects (user doesn't exist)
6. 📊 Brevo marks as "bounced" in dashboard

**Result:** System shows success, but email never delivered.

---

## Solutions

### 1. Pre-Send Validation (Current Implementation)

We validate email format before sending:

```javascript
// Validates: user@domain.com format
function validateEmailFormat(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
```

**Catches:**
- ✅ Missing @ symbol
- ✅ Missing domain
- ✅ Spaces in email
- ✅ Obviously malformed emails

**Does NOT Catch:**
- ❌ Typos in valid-looking emails
- ❌ Non-existent mailboxes
- ❌ Invalid domains

### 2. Monitor Brevo Dashboard

**Manual Monitoring:**
1. Log into [Brevo Dashboard](https://app.brevo.com)
2. Go to **Campaigns** → **Statistics**
3. Check **Bounce Rate**
4. View bounced emails and reasons

**Bounce Types:**
- **Hard Bounce**: Email doesn't exist, domain invalid (permanent)
- **Soft Bounce**: Mailbox full, temporary server issue (temporary)

### 3. Set Up Brevo Webhooks (Recommended)

Brevo can send real-time notifications when emails bounce:

**Setup Steps:**
1. Go to Brevo Dashboard → **Settings** → **Webhooks**
2. Create webhook for **Bounces** event
3. Point to your server endpoint
4. Receive bounce notifications in real-time

**Webhook Payload Example:**
```json
{
  "event": "hard_bounce",
  "email": "praveenkumaanmk.cse2024@citchennai.net",
  "date": "2026-01-22",
  "reason": "550 5.1.1 User unknown"
}
```

### 4. Best Practices

**Prevention:**
1. ✅ **Double-check CSV data** before uploading
2. ✅ **Use npm run validate** to check CSV format
3. ✅ **Test with known good emails** first
4. ✅ **Keep teacher email list updated**

**Detection:**
1. 📊 **Check Brevo dashboard daily** for bounce reports
2. 🔔 **Set up webhooks** for real-time bounce notifications
3. 📧 **Monitor admin summary emails** for delivery stats
4. 🔍 **Review GitHub Actions logs** for API errors

**Response:**
1. 🔧 **Fix typos** in CSV files immediately
2. 📝 **Update teacher records** when emails change
3. ⚠️ **Investigate high bounce rates** (>5%)
4. 📞 **Contact teachers** to verify email addresses

---

## Current System Capabilities

### ✅ What Admin Receives

**On API/System Errors:**
- Detailed error categorization
- Teacher email and section
- HTTP status codes
- Troubleshooting guidance
- System diagnostics

**On Successful Send:**
- Daily summary with success count
- Execution time
- List of emails sent

### ❌ What Admin Does NOT Receive

**Bounce Notifications:**
- System cannot detect bounces at send-time
- Bounces must be monitored via Brevo dashboard
- Consider implementing webhook listener for automated bounce detection

---

## Recommendations

### Short-term (Current System)
1. ✅ Validate email format (already implemented)
2. 📊 Manually check Brevo dashboard for bounces
3. 🔍 Review CSV files carefully before running

### Long-term (Future Enhancement)
1. 🔔 Implement Brevo webhook listener
2. 📧 Send admin email when bounces detected
3. 📊 Track bounce rates over time
4. 🤖 Auto-flag invalid emails in CSV

---

## Testing Email Validity

### Method 1: Use Test Email Script
```bash
npm run test:email
```
Sends test email to admin - verify receipt.

### Method 2: Check Brevo Dashboard
1. Send emails via `npm run send`
2. Wait 5-10 minutes
3. Check Brevo dashboard for delivery status
4. Look for bounces or failures

### Method 3: Use Small Test Set
1. Create test CSV with 1-2 known good emails
2. Run `npm run send`
3. Verify receipt
4. Then use full CSV

---

## Summary

**Current Limitation:**
- Brevo API returns success for valid-format emails
- Actual delivery failures (bounces) happen asynchronously
- System cannot detect bounces at send-time

**Workaround:**
- Monitor Brevo dashboard for bounce reports
- Validate CSV data carefully
- Consider implementing webhook listener for automated bounce detection

**What System DOES Detect:**
- Invalid email format
- API errors (auth, rate limits, network)
- Configuration issues
- CSV data problems
