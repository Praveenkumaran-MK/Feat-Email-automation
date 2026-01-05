# 🔧 Email Automation Setup Guide

Complete guide to configure your Brevo email automation system.

---

## 📋 Your Brevo Credentials

### API Configuration (Currently Used) ✅
```
API Key: your_brevo_api_key_here
```

### SMTP Configuration (Alternative)
```
SMTP Server: smtp-relay.brevo.com
Port: 587
Login: 9f0d6c001@smtp-brevo.com
Password: zy72pS6avZEsFkjB
```

---

## 🚀 Step 1: Local Setup

### 1.1 Create `.env` File

Create a file named `.env` in the root directory with this content:

```env
# Brevo API Configuration
BREVO_API_KEY=your_brevo_api_key_here
SENDER_EMAIL=your_verified_sender@example.com
```

**⚠️ IMPORTANT:** Replace `your_verified_sender@example.com` with your actual verified sender email from Brevo.

### 1.2 Verify Your Sender Email

1. Go to: https://app.brevo.com/senders
2. Add and verify your sender email address
3. Use that verified email in your `.env` file

### 1.3 Test Locally

```bash
npm install
npm run send
```

Expected output:
```
✅ Found 5 recipients
✅ [1/5] Sent to John Doe
✅ [2/5] Sent to Jane Smith
...
📊 Email Job Summary:
   ✅ Success: 5
```

---

## ☁️ Step 2: GitHub Actions Setup

### 2.1 Add GitHub Secrets

1. **Go to your repository on GitHub**
   - Navigate to: `Settings` → `Secrets and variables` → `Actions`

2. **Click "New repository secret"**

3. **Add the following secrets:**

   **Secret 1:**
   - Name: `BREVO_API_KEY`
   - Value: `your_brevo_api_key_here`

   **Secret 2:**
   - Name: `SENDER_EMAIL`
   - Value: `your_verified_sender@example.com` (replace with your actual verified email)

### 2.2 Test the Workflow

1. Go to the **Actions** tab in your GitHub repository
2. Select **"Daily Email Automation"** workflow
3. Click **"Run workflow"** → **"Run workflow"**
4. Wait for completion and check the logs

### 2.3 Verify Automatic Scheduling

- The workflow is scheduled to run daily at **7:00 AM IST** (1:30 AM UTC)
- Check the Actions tab to see past runs
- Emails will be sent automatically every day

---

## 🔄 Alternative: Using SMTP Instead of API

If you prefer to use SMTP instead of the Brevo API, follow these steps:

### 1. Install Nodemailer

```bash
npm install nodemailer
```

### 2. Update `.env` File

```env
# SMTP Configuration
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=9f0d6c001@smtp-brevo.com
SMTP_PASS=zy72pS6avZEsFkjB
SENDER_EMAIL=your_verified_sender@example.com
```

### 3. Create New Email Service

Create `src/services/smtpEmailService.js`:

```javascript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail(toEmail, subject, htmlContent) {
  try {
    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: toEmail,
      subject: subject,
      html: htmlContent,
    });
    console.log(`Email sent to ${toEmail}`);
  } catch (err) {
    console.error('Email failed:', err.message);
    throw err;
  }
}
```

### 4. Update Import in `sendEmails.js`

Change line 2 from:
```javascript
import { sendEmail } from "./services/emailService.js";
```

To:
```javascript
import { sendEmail } from "./services/smtpEmailService.js";
```

### 5. Update GitHub Secrets

Add these additional secrets:
- `SMTP_HOST`: `smtp-relay.brevo.com`
- `SMTP_PORT`: `587`
- `SMTP_USER`: `9f0d6c001@smtp-brevo.com`
- `SMTP_PASS`: `zy72pS6avZEsFkjB`

### 6. Update GitHub Workflow

Update `.github/workflows/daily-email.yml` to include SMTP variables:

```yaml
- name: Send daily emails
  env:
    SMTP_HOST: ${{ secrets.SMTP_HOST }}
    SMTP_PORT: ${{ secrets.SMTP_PORT }}
    SMTP_USER: ${{ secrets.SMTP_USER }}
    SMTP_PASS: ${{ secrets.SMTP_PASS }}
    SENDER_EMAIL: ${{ secrets.SENDER_EMAIL }}
  run: npm run send
```

---

## ✅ Verification Checklist

- [ ] `.env` file created with API key
- [ ] Sender email verified in Brevo dashboard
- [ ] Local test successful (`npm run send`)
- [ ] GitHub secrets added (`BREVO_API_KEY`, `SENDER_EMAIL`)
- [ ] Manual workflow test successful
- [ ] Automatic schedule verified in Actions tab

---

## 🛠️ Troubleshooting

### Error: "401 Unauthorized"
- **Cause:** Invalid API key or sender email not verified
- **Solution:** 
  - Check API key is correct
  - Verify sender email at https://app.brevo.com/senders

### Error: "Sender email not verified"
- **Cause:** Email address not verified in Brevo
- **Solution:** Go to Brevo dashboard and verify your sender email

### Workflow Not Running
- **Cause:** GitHub Secrets not set
- **Solution:** Double-check secrets are added correctly in repository settings

### Wrong Time Zone
- **Cause:** GitHub Actions uses UTC
- **Solution:** Current cron is `30 1 * * *` = 7:00 AM IST (UTC + 5:30)

---

## 📊 Brevo Free Tier Limits

- **300 emails per day** (free forever)
- Perfect for daily automation
- No credit card required

---

## 🔐 Security Best Practices

✅ **DO:**
- Keep `.env` file in `.gitignore`
- Use GitHub Secrets for sensitive data
- Verify sender emails before use
- Rotate API keys periodically

❌ **DON'T:**
- Commit `.env` file to Git
- Share API keys publicly
- Use unverified sender emails
- Hardcode credentials in code

---

## 📞 Support

- **Brevo Dashboard:** https://app.brevo.com
- **Brevo API Docs:** https://developers.brevo.com
- **GitHub Actions Docs:** https://docs.github.com/en/actions

---

**✨ You're all set! Your email automation is ready to go!**
