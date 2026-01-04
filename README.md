# Email Automation System

Automated email system that sends daily emails at 7 AM using **GitHub Actions** (100% free) and **Brevo** for email delivery.

## 🚀 Features

- ✅ **Lifetime Free Hosting** via GitHub Actions
- ✅ **Daily 7 AM Trigger** (IST timezone)
- ✅ **Mock Data** for 10 recipients (expandable to 300)
- ✅ **Brevo API** for reliable email delivery
- ✅ **Manual Trigger** option for testing
- ✅ **Comprehensive Logging** in GitHub Actions

## 🎯 Quick Start

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Add email automation"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2. Add GitHub Secrets

Go to **Settings** → **Secrets and variables** → **Actions** and add:

- `BREVO_API_KEY`: Your Brevo API key
- `SENDER_EMAIL`: Your verified sender email

### 3. Test Workflow

Go to **Actions** → **Daily Email Automation** → **Run workflow**

### 4. Done! 🎉

Emails will send automatically every day at 7 AM IST.

---

## 📝 Add Recipients

Edit `src/sendEmails.js` lines 7-18:

```javascript
const mockRecipients = [
  { name: "John Doe", email: "john.doe@example.com", department: "Engineering" },
  // Add up to 300 recipients here
];
```

---

## ⏰ Change Schedule

Edit `.github/workflows/daily-email.yml` line 6:

```yaml
- cron: '30 1 * * *'  # 7:00 AM IST
- cron: '30 3 * * *'  # 9:00 AM IST
```

**Note:** GitHub Actions uses UTC. IST = UTC + 5:30

---

## 🧪 Local Testing

```bash
npm install
npm run send
```

Expected output:
```
✅ Found 10 recipients
✅ [1/10] Sent to John Doe
...
📊 Email Job Summary:
   ✅ Success: 10
   ❌ Failed: 0
```

---

## 📊 Monitoring

View logs in **Actions** tab → Click workflow run → **send-emails** job

---

## 💰 Cost

**$0/month** - Completely free forever!

---

## 📚 Documentation

- [DEPLOYMENT.md](DEPLOYMENT.md) - Detailed deployment guide
- [supabase-schema.sql](supabase-schema.sql) - Optional: Migrate to database later

---

## 🛠️ Project Structure

```
.github/workflows/daily-email.yml  → Workflow (7 AM schedule)
src/sendEmails.js                  → Main script (mock data)
src/services/emailService.js       → Brevo integration
```

---

## 🔧 Customization

### Email Template
Edit `src/sendEmails.js` lines 48-68

### Add More Recipients
Edit `src/sendEmails.js` lines 7-18 (up to 300)

### Change Time
Edit `.github/workflows/daily-email.yml` line 6

---

## 📝 License

ISC

## 👤 Author

Praveenkumaran-MK
