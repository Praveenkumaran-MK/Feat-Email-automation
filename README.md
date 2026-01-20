# 📧 Email Automation System - V2.0

A production-ready email automation system that sends personalized daily emails using Brevo (formerly Sendinblue) and GitHub Actions.

## 🚀 Quick Start

1.  **Clone & Install**:
    ```bash
    npm install
    ```
2.  **Configure**: Create a `.env` file (see `.env.example`):
    ```env
    BREVO_API_KEY=your_xkeysib_...
    SENDER_EMAIL=your_verified_sender@email.com
    ```
3.  **Run Locally**:
    ```bash
    npm run test:local  # Sends to first 5 subscribers only
    npm run send        # Sends to all subscribers
    ```

## 🏗️ Folder Structure

- `src/` - Core logic and services
- `data/` - Subscriber CSV and templates
- `.github/workflows/` - Daily automation schedule
- `.env.example` - Template for credentials

## 📊 Data Management

Update files in the `data/` directory:
- `data/students.csv`: List of students on OD. Format: `name,emailid,regno,section,event,date`
- `data/teachers.csv`: List of teachers to notify. Format: `section,teacher_name,emailid`

Validate your data before running:
```bash
npm run validate
```

## ⚙️ Configuration

| Feature | Setting | Location |
|---------|---------|----------|
| **Schedule** | `0 2 * * *` (7:30 AM IST) | `.github/workflows/daily-email.yml` |
| **Rate Limit** | 2000ms | `.env` or `src/services/emailService.js` |
| **Max Emails** | 200/day | GitHub Workflow env |

## 🛠️ GitHub Actions Setup

1. Go to **Settings** → **Secrets and variables** → **Actions**.
2. Add secrets: `BREVO_API_KEY`, `SENDER_EMAIL`.
3. Optionally add: `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `ADMIN_EMAIL` for notifications.

# Email Automation - Quick Reference

## 🚨 **CRITICAL: Sender Email Not Verified**

**Your emails aren't being delivered because `yoUr Email@gmail.com` is not verified in Brevo!**

### ✅ Fix Now (2 minutes):
1. Go to https://app.brevo.com/senders/list
2. Add sender: `ucamsurveillance@gmail.com`
3. Click verification link in your Gmail
4. Run: `npm run check:brevo` to confirm

---

## 🧪 Diagnostic Commands

```bash
# Check Brevo configuration & sender verification
npm run check:brevo

# Send a test email
npm run test:email

# Full system diagnostic
npm run diagnose

# Dry run (no emails sent)
npm run test:local

# Send real emails (after verification!)
npm run send
```

## 📋 Why Emails Weren't Sent

1. ✅ Code works correctly
2. ✅ Brevo API accepts requests
3. ❌ **Brevo drops emails** (unverified sender)
4. ✅ Logs show "success" (API call succeeded)
5. ❌ **No delivery** (silent failure)

## 🎯 Next Steps

1. **Verify sender** (see above)
2. **Test**: `npm run test:email`
3. **Check inbox** for test email
4. **Update CSV** with today's date: `2026-01-20`
5. **Send**: `npm run send`



---
*Created by Praveenkumaran-MK*
