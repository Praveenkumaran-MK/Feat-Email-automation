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

## 📊 Subscriber Management

Update `data/subscribers.csv` with your recipient list.
- Format: `name,email,subscribed_date,department,preferences`
- Validate your data: `npm run validate`

## ⚙️ Configuration

| Feature | Setting | Location |
|---------|---------|----------|
| **Schedule** | `40 5 * * *` (UTC) | `.github/workflows/daily-email.yml` |
| **Rate Limit** | 2000ms | `.env` or `src/sendEmails.js` |
| **Max Emails** | 200/day | `package.json` |

## 🛠️ GitHub Actions Setup

1. Go to **Settings** → **Secrets and variables** → **Actions**.
2. Add secrets: `BREVO_API_KEY`, `SENDER_EMAIL`.
3. Optionally add: `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `ADMIN_EMAIL` for notifications.

---
*Created by Praveenkumaran-MK*
