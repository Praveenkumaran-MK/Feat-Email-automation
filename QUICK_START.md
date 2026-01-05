# 🚀 Quick Start Guide - Production Email Automation

**Get your system running in 45 minutes!**

---

## ✅ What You Have Now

- ✅ Production-ready code (all implemented)
- ✅ 200 sample subscribers in CSV
- ✅ Professional email templates
- ✅ Error notification system
- ✅ Rate limiting & retry logic
- ✅ Complete documentation

---

## 🎯 What You Need to Do (45 minutes)

### Step 1: Create `.env` File (5 min)

Create a file named `.env` in the project root:

```env
# Required - Get from Brevo
BREVO_API_KEY=your_brevo_api_key_here
SENDER_EMAIL=your_verified_sender@example.com

# Optional - For error notifications
GMAIL_USER=your_gmail@gmail.com
GMAIL_APP_PASSWORD=your_16_char_app_password
ADMIN_EMAIL=admin@example.com
```

**Replace:**
- `your_verified_sender@example.com` with your actual verified email

---

### Step 2: Verify Sender Email (5 min)

1. Go to: https://app.brevo.com/senders
2. Click "Add a new sender"
3. Enter your email address
4. Check your inbox and click verification link
5. Update `SENDER_EMAIL` in `.env` with verified email

---

### Step 3: Test Locally (5 min)

```bash
# Test with first 5 subscribers
npm run test:local
```

**Expected Output:**
```
✅ [1/5] Sent to Alice Johnson
✅ [2/5] Sent to Bob Smith
...
📊 EXECUTION SUMMARY
✅ Successful: 5/5 (100.0%)
```

**Check:**
- Emails received in inboxes
- Personalization working
- No errors

---

### Step 4: Configure GitHub Secrets (10 min)

1. Go to your GitHub repository
2. Navigate to: **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**

**Add these secrets:**

| Name | Value |
|------|-------|
| `BREVO_API_KEY` | `your_brevo_api_key_here` |
| `SENDER_EMAIL` | Your verified sender email |
| `GMAIL_USER` | Your Gmail (optional) |
| `GMAIL_APP_PASSWORD` | Gmail app password (optional) |
| `ADMIN_EMAIL` | Admin email (optional) |

---

### Step 5: Test GitHub Workflow (10 min)

1. Go to **Actions** tab in GitHub
2. Select **"Daily Email Automation - Production"**
3. Click **"Run workflow"** → **"Run workflow"**
4. Wait for completion (~7-8 minutes)
5. Check logs for success

**Expected:**
- ✅ Green checkmark
- ✅ All 200 emails sent
- ✅ No errors

---

### Step 6: Verify Emails (5 min)

- Check recipient inboxes
- Verify personalization (name, department)
- Check formatting (responsive, professional)
- Confirm unsubscribe link present

---

### Step 7: Monitor Schedule (5 min)

- Workflow runs automatically at **7:30 AM IST** (2:00 AM UTC)
- Check Actions tab tomorrow for automatic run
- Monitor for 3 consecutive days

---

## 📋 Quick Commands

```bash
# Validate CSV file
npm run validate

# Test with 5 subscribers
npm run test:local

# Send to all 200 subscribers
npm run send
```

---

## 🔧 Optional: Gmail Setup

For error notifications:

1. Enable 2FA on Gmail
2. Go to: https://myaccount.google.com/apppasswords
3. Generate app password for "Mail"
4. Add to `.env`:
   ```env
   GMAIL_USER=your_gmail@gmail.com
   GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
   ADMIN_EMAIL=your_gmail@gmail.com
   ```

---

## 📊 System Info

**Schedule:** 7:30 AM IST daily
**Emails:** 200 per day
**Execution Time:** ~7 minutes
**Cost:** $0/month
**Maintenance:** Zero

---

## 🛠️ Troubleshooting

| Issue | Solution |
|-------|----------|
| 401 Error | Verify sender email at https://app.brevo.com/senders |
| No subscribers | Run `npm run validate` |
| Workflow not running | Check GitHub Secrets are set |
| Gmail not working | Check 2FA enabled and app password correct |

---

## 📚 Full Documentation

- **[PRODUCTION_GUIDE.md](file:///d:/Email-automation/PRODUCTION_GUIDE.md)** - Complete guide
- **[data/README.md](file:///d:/Email-automation/data/README.md)** - Subscriber management
- **[README.md](file:///d:/Email-automation/README.md)** - Quick reference

---

## ✅ Checklist

- [ ] Created `.env` file
- [ ] Verified sender email in Brevo
- [ ] Tested locally (`npm run test:local`)
- [ ] Configured GitHub Secrets
- [ ] Tested manual workflow
- [ ] Verified emails received
- [ ] Confirmed automatic schedule

---

**🎉 Once all steps are complete, your system will send 200 emails automatically every day at 7:30 AM IST!**

**Total Time:** 45 minutes
**Monthly Cost:** $0
**Maintenance:** Zero
