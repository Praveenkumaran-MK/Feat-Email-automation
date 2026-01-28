# 📧 Email Automation System

A production-ready email automation system that sends personalized daily emails using Brevo (formerly Sendinblue), Firebase Firestore, and GitHub Actions.

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Firebase Setup

**First-time setup:** Follow the [Firebase Setup Guide](FIREBASE_SETUP.md) to:
1. Create a Firebase project
2. Enable Firestore
3. Download service account credentials
4. Run data migration

### Configuration

Create a `.env` file based on `.env.example`:

```env
BREVO_API_KEY=your_xkeysib_...
SENDER_EMAIL=your_verified_sender@email.com
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
```

### Running Locally

```bash
npm run test:local  # Sends to first 5 subscribers only
npm run send        # Sends to all subscribers
npm run migrate     # Migrate CSV data to Firestore (one-time)
```

## 🏗️ Project Structure

```
Email-automation/
├── src/
│   ├── services/
│   │   ├── firestoreService.js  # Firebase Firestore operations
│   │   ├── emailService.js      # Brevo email sending
│   │   └── ...
│   ├── templates/               # Email templates
│   └── index.js                 # Main application logic
├── scripts/
│   └── migrateData.js          # CSV to Firestore migration
├── data/                        # Legacy CSV files (for migration)
├── .github/workflows/           # Daily automation schedule
└── .env.example                # Template for credentials
```

## 📊 Data Management

Data is now stored in **Firebase Firestore** with two collections:

### Firestore Collections

**`od_requests`** - Daily OD requests
```javascript
{
  studentId: "24CS0553",
  toDate: "2026-02-04", // String format
  reason: "Hackathon",
  type: "External",
  status: "pending"
}
```

**`students`** - Student Profiles (ID = Register No)
```javascript
{
  name: "Student Name",
  collegeEmail: "student@citchennai.net",
  department: "CSE",
  section: "A"
}
```

**`advisor_mapping`** - Teacher/Advisor Config (ID = DEPT_SECTION e.g., CSE_A)
```javascript
{
  advisorEmails: ["advisor1@cit.net", "advisor2@cit.net"],
  department: "CSE",
  section: "A"
}
```

### Managing Data

Data is managed through your web application. The email automation system has **read-only** access to Firestore.

**Legacy CSV files** (`data/students.csv`, `data/teachers.csv`) are kept for reference but are no longer used by the system.

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

*Created by [Muthukumaran-K-1](https://github.com/Muthukumaran-K-1),[MudharsonPrabhu](https://github.com/MudharsonPrabhu),[Praveenkumaran-MK](https://github.com/Praveenkumaran-MK),[Kesavamurthy](https://github.com/Kesavamurthy)*

