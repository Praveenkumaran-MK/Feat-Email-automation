# 🚀 Production Email Automation System - Deployment Guide

Complete guide to deploy and operate a production-ready email automation system that sends 200 personalized emails daily at 7:30 AM IST.

---

## 📋 System Overview

**What You Get:**
- ✅ 200 personalized emails sent daily
- ✅ Scheduled at 7:30 AM IST automatically
- ✅ 100% free operation (GitHub Actions + Brevo)
- ✅ Zero ongoing maintenance
- ✅ Error notifications via Gmail
- ✅ Rate limiting for API safety
- ✅ Professional email templates
- ✅ CSV-based subscriber management

**Setup Time:** 45 minutes
**Ongoing Cost:** $0/month
**Maintenance:** Zero

---

## 🎯 Prerequisites

### Required Accounts (All Free)

1. **GitHub Account** (for hosting and automation)
   - Sign up: https://github.com/join

2. **Brevo Account** (for sending emails)
   - Sign up: https://app.brevo.com/account/register
   - Free tier: 300 emails/day

3. **Gmail Account** (optional, for error notifications)
   - Enable 2-factor authentication
   - Generate app password

### Required Software

- **Node.js 20+** - https://nodejs.org/
- **Git** - https://git-scm.com/
- **Text Editor** - VS Code, Notepad++, etc.

---

## 🚀 Quick Start (45 Minutes)

### Phase 1: Local Setup (10 minutes)

#### Step 1: Install Dependencies
```bash
cd d:\Email-automation
npm install
```

**Expected Output:**
```
added 5 packages
```

#### Step 2: Configure Environment

Create `.env` file in project root:

```env
# Required: Brevo API
BREVO_API_KEY=your_brevo_api_key_here
SENDER_EMAIL=your_verified_sender@example.com

# Optional: Gmail notifications
GMAIL_USER=your_gmail@gmail.com
GMAIL_APP_PASSWORD=your_16_char_app_password
ADMIN_EMAIL=admin@example.com

# Optional: Rate limiting
RATE_LIMIT_DELAY_MS=2000
MAX_EMAILS_PER_DAY=200
```

**Important:**
- Replace `your_verified_sender@example.com` with your verified Brevo sender email
- Gmail fields are optional but recommended

#### Step 3: Verify Sender Email

1. Go to: https://app.brevo.com/senders
2. Click "Add a new sender"
3. Enter your email address
4. Check inbox and verify
5. Update `SENDER_EMAIL` in `.env`

---

### Phase 2: Subscriber Management (10 minutes)

#### Step 4: Review Subscriber Data

The system includes 200 sample subscribers in `data/subscribers.csv`.

**To use your own subscribers:**

1. Open `data/subscribers.csv`
2. Replace with your subscriber data
3. Keep the header row:
   ```csv
   name,email,subscribed_date,department,preferences
   ```

**CSV Format:**
- `name` - Full name (required)
- `email` - Valid email (required)
- `subscribed_date` - YYYY-MM-DD format (optional)
- `department` - Department name (optional)
- `preferences` - tech/business/marketing/general (optional)

#### Step 5: Validate CSV

```bash
npm run validate
```

**Expected Output:**
```
✅ VALIDATION SUCCESSFUL
Total Valid Subscribers: 200
```

---

### Phase 3: Local Testing (5 minutes)

#### Step 6: Test with 5 Subscribers

```bash
npm run test:local
```

**Expected Output:**
```
🚀 EMAIL AUTOMATION SYSTEM - PRODUCTION MODE
🧪 Test Mode: YES (first 5 subscribers only)
✅ [1/5] Sent to Alice Johnson
✅ [2/5] Sent to Bob Smith
...
📊 EXECUTION SUMMARY
✅ Successful: 5/5 (100.0%)
```

**Verify:**
- Check recipient inboxes
- Emails should be personalized
- Professional formatting
- No errors in console

---

### Phase 4: Gmail Setup (Optional, 5 minutes)

#### Step 7: Generate Gmail App Password

1. Go to: https://myaccount.google.com/apppasswords
2. Sign in to your Gmail account
3. Select "Mail" and "Other (Custom name)"
4. Enter "Email Automation"
5. Click "Generate"
6. Copy the 16-character password
7. Add to `.env`:
   ```env
   GMAIL_USER=your_gmail@gmail.com
   GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
   ADMIN_EMAIL=your_gmail@gmail.com
   ```

**Note:** Remove spaces from app password when adding to `.env`

---

### Phase 5: GitHub Deployment (10 minutes)

#### Step 8: Push to GitHub

```bash
git add .
git commit -m "Production email automation system v2.0"
git push origin main
```

#### Step 9: Configure GitHub Secrets

1. Go to your repository on GitHub
2. Navigate to: **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**

**Add these secrets:**

| Secret Name | Value | Required |
|-------------|-------|----------|
| `BREVO_API_KEY` | Your Brevo API key | ✅ Yes |
| `SENDER_EMAIL` | Your verified sender email | ✅ Yes |
| `GMAIL_USER` | Your Gmail address | ⚠️ Optional |
| `GMAIL_APP_PASSWORD` | Gmail app password | ⚠️ Optional |
| `ADMIN_EMAIL` | Admin notification email | ⚠️ Optional |

**Screenshot Guide:**
```
Settings → Secrets and variables → Actions → New repository secret

Name: BREVO_API_KEY
Value: your_brevo_api_key_here

[Add secret]
```

#### Step 10: Test Workflow

1. Go to **Actions** tab
2. Select **"Daily Email Automation - Production"**
3. Click **"Run workflow"** → **"Run workflow"**
4. Wait for completion (~7-8 minutes)
5. Check logs for success

**Expected:**
- ✅ Green checkmark
- ✅ All 200 emails sent
- ✅ No errors in logs

---

### Phase 6: Verification (5 minutes)

#### Step 11: Verify Email Delivery

- Check recipient inboxes
- Verify personalization (name, department, preferences)
- Check email formatting (responsive, professional)
- Confirm unsubscribe link present

#### Step 12: Verify Error Notifications (if Gmail configured)

- Check admin email for daily summary
- Should include execution statistics
- Success rate should be 100%

#### Step 13: Verify Schedule

- Workflow will run automatically at **7:30 AM IST** (2:00 AM UTC)
- Check Actions tab next day for automatic run
- Monitor for 3 consecutive days

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     GitHub Actions                          │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Cron: 0 2 * * * (7:30 AM IST)                     │    │
│  │  Runs: npm run send                                 │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                  Email Automation System                    │
│  ┌────────────────────────────────────────────────────┐    │
│  │  1. Load 200 subscribers from CSV                  │    │
│  │  2. Validate email addresses                       │    │
│  │  3. Generate personalized content                  │    │
│  │  4. Send with rate limiting (2s delay)             │    │
│  │  5. Track success/failure                          │    │
│  │  6. Send admin notification                        │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
         ↓                                    ↓
┌──────────────────────┐          ┌──────────────────────┐
│   Brevo API          │          │   Gmail SMTP         │
│   (Email Sending)    │          │   (Notifications)    │
│   300 emails/day     │          │   Error alerts       │
└──────────────────────┘          └──────────────────────┘
         ↓                                    ↓
┌──────────────────────┐          ┌──────────────────────┐
│   200 Subscribers    │          │   Admin Email        │
│   Personalized       │          │   Daily Summary      │
└──────────────────────┘          └──────────────────────┘
```

---

## 🔧 Configuration Options

### Email Schedule

**Current:** 7:30 AM IST (2:00 AM UTC)

**To change:**
Edit `.github/workflows/daily-email.yml` line 6:

```yaml
# Examples:
- cron: '0 2 * * *'   # 7:30 AM IST
- cron: '30 3 * * *'  # 9:00 AM IST
- cron: '0 1 * * *'   # 6:30 AM IST
```

**Cron Calculator:** https://crontab.guru/

### Rate Limiting

**Current:** 2 seconds between emails

**To change:**
Update `.env`:

```env
RATE_LIMIT_DELAY_MS=3000  # 3 seconds
```

**Calculation:**
- 200 emails × 2 seconds = 400 seconds = ~7 minutes
- 200 emails × 3 seconds = 600 seconds = ~10 minutes

### Daily Quota

**Current:** 200 emails/day

**To change:**
Update `.env`:

```env
MAX_EMAILS_PER_DAY=250
```

**Brevo Limits:**
- Free tier: 300 emails/day
- Recommended: Stay below 250 for safety margin

---

## 📧 Email Personalization

### Content Types by Preference

| Preference | Content | Target Audience |
|------------|---------|-----------------|
| `tech` | Technology updates, dev insights | Engineers, Developers |
| `business` | Business insights, market trends | Managers, Executives |
| `marketing` | Marketing strategies, campaigns | Marketers, Content Creators |
| `general` | General updates, tips | All subscribers |

### Customization

Edit `src/templates/emailTemplate.js` to:
- Change email design
- Add new content sections
- Modify personalization logic
- Update branding

---

## 🛠️ Maintenance & Monitoring

### Daily Monitoring

**Automated:**
- GitHub Actions runs automatically
- Error notifications sent to admin
- Daily summary email with statistics

**Manual (Optional):**
- Check Actions tab for run status
- Review Brevo dashboard for delivery rates
- Monitor admin email for notifications

### Weekly Tasks

- Review failed emails (if any)
- Update subscriber list as needed
- Check Brevo quota usage

### Monthly Tasks

- Review email performance metrics
- Update email content/templates
- Rotate API keys (security best practice)

---

## 🚨 Troubleshooting

### Common Issues

#### 1. "BREVO_API_KEY environment variable is not set"

**Cause:** Missing or incorrect API key

**Solution:**
- Check `.env` file has `BREVO_API_KEY`
- Verify API key is correct
- For GitHub Actions, check secret is set

#### 2. "No valid subscribers found"

**Cause:** CSV file missing or invalid

**Solution:**
```bash
npm run validate
```
- Check `data/subscribers.csv` exists
- Verify CSV format is correct
- Ensure at least one valid subscriber

#### 3. "Email send failed: 401"

**Cause:** Invalid API key or sender not verified

**Solution:**
- Verify sender email at https://app.brevo.com/senders
- Check API key is active
- Regenerate API key if needed

#### 4. Workflow not running automatically

**Cause:** GitHub Secrets not set or schedule issue

**Solution:**
- Verify all required secrets are set
- Check workflow file syntax
- Manually trigger to test

#### 5. Gmail notifications not working

**Cause:** Invalid app password or 2FA not enabled

**Solution:**
- Enable 2-factor authentication on Gmail
- Generate new app password
- Update `GMAIL_APP_PASSWORD` secret

---

## 📈 Performance Metrics

### Expected Performance

- **Execution Time:** 6-8 minutes for 200 emails
- **Success Rate:** 99%+ (with retry logic)
- **API Calls:** 200-210 (including retries)
- **GitHub Actions Usage:** ~8 minutes/day
- **Monthly Cost:** $0

### Monitoring

**GitHub Actions:**
- View execution logs in Actions tab
- Download logs for detailed analysis
- Set up status badges (optional)

**Brevo Dashboard:**
- Track email delivery rates
- Monitor bounce rates
- View open/click rates

---

## 🔐 Security Best Practices

### Do's ✅

- ✅ Use environment variables for credentials
- ✅ Keep `.env` in `.gitignore`
- ✅ Use GitHub Secrets for production
- ✅ Rotate API keys every 90 days
- ✅ Enable 2FA on all accounts
- ✅ Monitor for suspicious activity
- ✅ Use app passwords (not account passwords)

### Don'ts ❌

- ❌ Never commit `.env` to Git
- ❌ Never share API keys publicly
- ❌ Never use personal passwords
- ❌ Never exceed Brevo rate limits
- ❌ Never send to unverified emails
- ❌ Never ignore error notifications

---

## 📞 Support & Resources

### Documentation

- **Brevo API Docs:** https://developers.brevo.com/
- **GitHub Actions Docs:** https://docs.github.com/en/actions
- **Nodemailer Docs:** https://nodemailer.com/

### Dashboards

- **Brevo Dashboard:** https://app.brevo.com
- **GitHub Actions:** https://github.com/YOUR_USERNAME/YOUR_REPO/actions
- **Gmail App Passwords:** https://myaccount.google.com/apppasswords

### Getting Help

1. Check troubleshooting section above
2. Review GitHub Actions logs
3. Check Brevo dashboard for API errors
4. Verify all configuration is correct

---

## 🎉 Success Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created with all credentials
- [ ] Sender email verified in Brevo
- [ ] CSV file validated (`npm run validate`)
- [ ] Local test successful (`npm run test:local`)
- [ ] GitHub Secrets configured
- [ ] Manual workflow test successful
- [ ] Emails received and properly formatted
- [ ] Error notifications working (if configured)
- [ ] Automatic schedule verified

---

## 📊 System Status

**Version:** 2.0.0
**Last Updated:** 2026-01-05
**Status:** Production Ready ✅

**Features:**
- ✅ 200 personalized emails daily
- ✅ Scheduled at 7:30 AM IST
- ✅ Rate limiting (2s delay)
- ✅ Retry logic (3 attempts)
- ✅ Error notifications
- ✅ Daily summaries
- ✅ CSV-based management
- ✅ Professional templates
- ✅ Zero maintenance
- ✅ 100% free

---

**🚀 Your email automation system is ready for production!**

**Estimated setup time:** 45 minutes
**Ongoing maintenance:** Zero
**Monthly cost:** $0
**Reliability:** 99%+

**Questions?** Review the troubleshooting section or check the documentation links above.
