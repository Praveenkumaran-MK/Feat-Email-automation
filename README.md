# 📧 Email Automation System

A production-ready email automation system that sends personalized daily emails using Brevo (formerly Sendinblue) and GitHub Actions.

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Configuration

Create a `.env` file based on `.env.example`:

```env
BREVO_API_KEY=your_xkeysib_...
SENDER_EMAIL=your_verified_sender@email.com
```

### Running Locally

```bash
npm run test:local  # Sends to first 5 subscribers only
npm run send        # Sends to all subscribers
```

## 🏗️ Project Structure

```
Email-automation/
├── src/                    # Core logic and services
├── data/                   # Subscriber CSV and templates
├── .github/workflows/      # Daily automation schedule
└── .env.example           # Template for credentials
```

## 📊 Data Management

Update files in the `data/` directory:

- **`data/students.csv`**: List of students on OD
  - Format: `name,emailid,regno,section,event,date`
- **`data/teachers.csv`**: List of teachers to notify
  - Format: `section,teacher_name,emailid`

### Validate Data

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

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add required secrets:
   - `BREVO_API_KEY`
   - `SENDER_EMAIL`
3. Optional secrets for notifications:
   - `GMAIL_USER`
   - `GMAIL_APP_PASSWORD`
   - `ADMIN_EMAIL`

## 🧪 Testing & Diagnostics

### Available Commands

```bash
# Check Brevo configuration & sender verification
npm run check:brevo

# Send a test email
npm run test:email

# Full system diagnostic
npm run diagnose

# Dry run (no emails sent)
npm run test:local

# Send real emails (production)
npm run send
```

## 🚨 Troubleshooting

### Emails Not Being Delivered?

**Most common issue**: Sender email not verified in Brevo

#### ✅ Fix Steps (2 minutes):

1. Go to [Brevo Senders List](https://app.brevo.com/senders/list)
2. Add your sender email
3. Click verification link in your email inbox
4. Run `npm run check:brevo` to confirm

### Why Emails Weren't Sent

- ✅ Code works correctly
- ✅ Brevo API accepts requests
- ❌ **Brevo drops emails** (unverified sender)
- ✅ Logs show "success" (API call succeeded)
- ❌ **No delivery** (silent failure)

## 📝 Workflow

1. **Verify sender** in Brevo
2. **Test**: `npm run test:email`
3. **Check inbox** for test email
4. **Update CSV** with current date
5. **Send**: `npm run send`

## 📄 License

MIT

---

*Created by [Praveenkumaran-MK](https://github.com/Praveenkumaran-MK)*
