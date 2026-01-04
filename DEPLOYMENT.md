# 🚀 Quick Deployment Guide (Mock Data Version)

Deploy your email automation to GitHub Actions in **5 minutes** - no database setup needed!

## ✅ What You Have

- ✅ Mock data with 10 recipients (expandable to 300)
- ✅ GitHub Actions workflow ready
- ✅ Brevo API already configured
- ✅ Tested and working locally

## 📋 Deployment Steps

### Step 1: Push to GitHub

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Add GitHub Actions email automation"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/Praveenkumaran-MK/Email-automation.git
git branch -M main
git push -u origin main
```

### Step 2: Configure GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these **2 secrets**:

| Secret Name | Value |
|------------|-------|
| `BREVO_API_KEY` | `your_brevo_api_key_here` |
| `SENDER_EMAIL` | `your_sender_email@example.com` |

### Step 3: Test the Workflow

1. Go to **Actions** tab in GitHub
2. Click **Daily Email Automation**
3. Click **Run workflow** → **Run workflow**
4. Wait ~1 minute
5. Click on the running workflow to see logs
6. Verify: "✅ Success: 10"

### Step 4: Done! 🎉

Your emails will now send automatically **every day at 7:00 AM IST**.

---

## 📝 Add More Recipients

Edit `src/sendEmails.js` lines 7-18 to add more recipients:

```javascript
const mockRecipients = [
  { name: "John Doe", email: "john.doe@example.com", department: "Engineering" },
  { name: "Jane Smith", email: "jane.smith@example.com", department: "Marketing" },
  // Add more recipients here (up to 300)
  { name: "Your Name", email: "your.email@example.com", department: "Your Dept" },
];
```

Then commit and push:
```bash
git add src/sendEmails.js
git commit -m "Add more recipients"
git push
```

---

## ⏰ Change Schedule Time

Edit `.github/workflows/daily-email.yml` line 6:

```yaml
# For 9:00 AM IST (3:30 AM UTC)
- cron: '30 3 * * *'

# For 6:00 AM IST (0:30 AM UTC)
- cron: '30 0 * * *'
```

Use [crontab.guru](https://crontab.guru/) to generate cron expressions.

**Remember:** GitHub Actions uses UTC time. IST = UTC + 5:30

---

## 🎨 Customize Email Template

Edit `src/sendEmails.js` lines 48-68 to change the email design:

```javascript
const htmlContent = `
  <div style="font-family: Arial, sans-serif;">
    <h2>Hello ${name}!</h2>
    <p>Your custom message here...</p>
  </div>
`;
```

---

## 🔍 Monitor Emails

### View Logs
1. Go to **Actions** tab in GitHub
2. Click any workflow run
3. Click **send-emails** job
4. Expand **Send daily emails** step

### Expected Output
```
🚀 Starting daily email job at 1/4/2026, 7:00:00 AM
============================================================
✅ Found 10 recipients

✅ [1/10] Sent to John Doe (john.doe@example.com)
✅ [2/10] Sent to Jane Smith (jane.smith@example.com)
...
✅ [10/10] Sent to Patricia Jackson (patricia.jackson@example.com)

============================================================
📊 Email Job Summary:
   ✅ Success: 10
   ❌ Failed: 0
   📧 Total: 10
============================================================
✅ Job completed successfully
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Workflow not running | Check GitHub Secrets are set correctly |
| Emails not sending | Verify Brevo API key is valid (300/day limit) |
| Wrong time | Remember UTC conversion: 7 AM IST = 1:30 AM UTC |
| "Secret not found" | Double-check secret names: `BREVO_API_KEY`, `SENDER_EMAIL` |

---

## � Cost

**$0/month forever** - Completely free!

- GitHub Actions: Free (2,000 min/month)
- Brevo: Free (300 emails/day)

---

## 🎯 Next Steps

1. ✅ Push code to GitHub
2. ✅ Add 2 GitHub Secrets
3. ✅ Test workflow manually
4. ✅ Add your real recipient emails
5. ✅ Enjoy automated emails every morning!

---

## 📚 Files Overview

```
.github/workflows/daily-email.yml  → GitHub Actions workflow (7 AM schedule)
src/sendEmails.js                  → Main script with mock data
src/services/emailService.js       → Brevo email service
package.json                       → Dependencies and scripts
```

---

## ⚡ Quick Test Locally

```bash
npm run send
```

You should see all 10 emails being sent!

---

**That's it!** Your email automation is now running on GitHub's infrastructure, completely free, forever. 🚀
