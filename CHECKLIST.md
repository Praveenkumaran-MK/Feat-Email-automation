# ✅ Setup Checklist

Follow this checklist to complete your email automation setup.

---

## 📋 Pre-Setup

- [ ] **Read** [CONFIGURATION_SUMMARY.md](file:///d:/Email-automation/CONFIGURATION_SUMMARY.md) for overview
- [ ] **Review** [SETUP_GUIDE.md](file:///d:/Email-automation/SETUP_GUIDE.md) for detailed instructions
- [ ] **Keep** [CREDENTIALS.md](file:///d:/Email-automation/CREDENTIALS.md) handy for reference

---

## 🔧 Local Development Setup

### Step 1: Create Environment File
- [ ] Create `.env` file in project root
- [ ] Copy this content to `.env`:
  ```env
  BREVO_API_KEY=your_brevo_api_key_here
  SENDER_EMAIL=your_verified_sender@example.com
  ```
- [ ] **DO NOT** commit `.env` to Git (already in `.gitignore`)

### Step 2: Verify Sender Email
- [ ] Go to https://app.brevo.com/senders
- [ ] Click "Add a new sender"
- [ ] Enter your email address
- [ ] Check your inbox for verification email
- [ ] Click verification link
- [ ] Update `SENDER_EMAIL` in `.env` with verified email

### Step 3: Install Dependencies
- [ ] Open terminal in project directory
- [ ] Run: `npm install`
- [ ] Wait for installation to complete

### Step 4: Test Locally
- [ ] Run: `npm run send`
- [ ] Check console output for success messages
- [ ] Verify emails were received in recipient inboxes
- [ ] Confirm no errors in console

**Expected Output:**
```
✅ Found 5 recipients
✅ [1/5] Sent to John Doe
✅ [2/5] Sent to Jane Smith
✅ [3/5] Sent to Michael Johnson
✅ [4/5] Sent to Emily Davis
✅ [5/5] Sent to David Wilson
📊 Email Job Summary:
   ✅ Success: 5
   ❌ Failed: 0
```

---

## ☁️ GitHub Actions Setup

### Step 5: Add GitHub Secrets
- [ ] Go to your GitHub repository
- [ ] Navigate to: `Settings` → `Secrets and variables` → `Actions`
- [ ] Click "New repository secret"

**Secret 1:**
- [ ] Name: `BREVO_API_KEY`
- [ ] Value: `your_brevo_api_key_here`
- [ ] Click "Add secret"

**Secret 2:**
- [ ] Name: `SENDER_EMAIL`
- [ ] Value: `your_verified_sender@example.com` (your actual verified email)
- [ ] Click "Add secret"

### Step 6: Test GitHub Workflow
- [ ] Go to `Actions` tab in GitHub
- [ ] Click "Daily Email Automation" workflow
- [ ] Click "Run workflow" button
- [ ] Select branch (usually `main`)
- [ ] Click green "Run workflow" button
- [ ] Wait for workflow to complete (~1-2 minutes)
- [ ] Check for green checkmark (success)
- [ ] Click on the workflow run to see logs
- [ ] Verify emails were sent successfully

### Step 7: Verify Automatic Schedule
- [ ] Confirm workflow is scheduled for 7:00 AM IST
- [ ] Check `.github/workflows/daily-email.yml` shows: `cron: '30 1 * * *'`
- [ ] Workflow will run automatically every day

---

## 🎨 Customization (Optional)

### Customize Recipients
- [ ] Open `src/sendEmails.js`
- [ ] Find `mockRecipients` array (lines 7-33)
- [ ] Add/remove/modify recipients
- [ ] Save file
- [ ] Test locally: `npm run send`
- [ ] Commit and push changes

### Change Schedule
- [ ] Open `.github/workflows/daily-email.yml`
- [ ] Find `cron:` line (line 6)
- [ ] Update cron expression (remember: UTC time)
- [ ] Examples:
  - 9:00 AM IST: `cron: '30 3 * * *'`
  - 6:00 AM IST: `cron: '30 0 * * *'`
- [ ] Save and push changes

### Customize Email Template
- [ ] Open `src/sendEmails.js`
- [ ] Find `htmlContent` variable (lines 59-78)
- [ ] Modify HTML content as needed
- [ ] Test locally: `npm run send`
- [ ] Commit and push changes

---

## 🔍 Verification

### Final Checks
- [ ] Local testing works (`npm run send`)
- [ ] GitHub workflow runs successfully
- [ ] Emails are received by all recipients
- [ ] No errors in workflow logs
- [ ] Schedule is correct (7:00 AM IST)
- [ ] `.env` is NOT committed to Git
- [ ] `CREDENTIALS.md` is NOT committed to Git
- [ ] GitHub Secrets are set correctly

---

## 📊 Monitoring

### Daily Monitoring
- [ ] Check Actions tab for daily runs
- [ ] Verify emails are being sent
- [ ] Monitor Brevo dashboard for usage
- [ ] Check for any failed runs

### Weekly Review
- [ ] Review email delivery rates
- [ ] Check Brevo free tier usage (300/day limit)
- [ ] Update recipients if needed
- [ ] Review and update email content

---

## 🛠️ Troubleshooting

If you encounter issues, check:

- [ ] API key is correct and not expired
- [ ] Sender email is verified in Brevo
- [ ] GitHub Secrets are set correctly
- [ ] `.env` file exists and has correct values
- [ ] No typos in environment variable names
- [ ] Brevo account is active
- [ ] Not exceeding 300 emails/day limit

**Need help?** See [SETUP_GUIDE.md](file:///d:/Email-automation/SETUP_GUIDE.md) troubleshooting section.

---

## ✅ Completion

Once all items are checked:

- [ ] **Local setup complete** ✅
- [ ] **GitHub Actions configured** ✅
- [ ] **Emails sending successfully** ✅
- [ ] **Automation running daily** ✅

---

## 🎉 Success!

**Congratulations!** Your email automation system is fully operational.

**What happens now:**
- Emails will be sent automatically every day at 7:00 AM IST
- You can monitor runs in the GitHub Actions tab
- You can manually trigger emails anytime via "Run workflow"
- System is 100% free and will run indefinitely

**Next steps:**
- Customize recipients and email content
- Monitor delivery rates
- Enjoy automated emails! 🚀

---

**Estimated setup time:** 10-15 minutes
**Difficulty:** Easy ⭐⭐☆☆☆
