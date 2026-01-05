# Subscriber Data Management

This directory contains subscriber data for the email automation system.

---

## 📄 File Structure

- **subscribers.csv** - Main subscriber list (200 subscribers)
- **subscribers-template.csv** - Template for adding new subscribers

---

## 📋 CSV Format

The CSV file must have the following columns:

| Column | Required | Description | Example |
|--------|----------|-------------|---------|
| `name` | ✅ Yes | Subscriber's full name | John Doe |
| `email` | ✅ Yes | Valid email address | john@example.com |
| `subscribed_date` | ⚠️ Optional | Subscription date (YYYY-MM-DD) | 2025-01-01 |
| `department` | ⚠️ Optional | Department name | Engineering |
| `preferences` | ⚠️ Optional | Content preference (tech/business/marketing/general) | tech |
| `custom_field_1` | ⚠️ Optional | Custom field for personalization | |
| `custom_field_2` | ⚠️ Optional | Custom field for personalization | |

---

## ✅ Adding Subscribers

### Method 1: Edit CSV Directly

1. Open `subscribers.csv` in Excel, Google Sheets, or text editor
2. Add new row with subscriber information
3. Ensure email is valid and unique
4. Save the file
5. Run validation: `npm run validate`

### Method 2: Use Template

1. Copy `subscribers-template.csv`
2. Fill in subscriber information
3. Append to `subscribers.csv`
4. Run validation: `npm run validate`

---

## 🔍 Validation Rules

The system validates each subscriber:

- ✅ **Name**: Must not be empty
- ✅ **Email**: Must be valid email format
- ✅ **Email**: Must be unique (no duplicates)
- ⚠️ **Department**: Defaults to "General" if empty
- ⚠️ **Preferences**: Defaults to "general" if empty
- ⚠️ **Subscribed Date**: Defaults to current date if empty

---

## 🧪 Testing

### Validate CSV File
```bash
npm run validate
```

**Expected Output:**
```
📊 CSV Validation Results:
   ✅ Valid subscribers: 200
```

### Test with Sample Data
```bash
npm run test:local
```

This sends emails to the first 5 subscribers only.

---

## 🎨 Preference Types

Subscribers receive personalized content based on their preference:

| Preference | Content Type | Target Audience |
|------------|--------------|-----------------|
| `tech` | Technology updates and development insights | Engineers, Developers |
| `business` | Business insights and market trends | Managers, Executives |
| `marketing` | Marketing strategies and campaigns | Marketers, Content Creators |
| `general` | General updates and tips | All subscribers |

---

## 📊 Current Statistics

- **Total Subscribers**: 200
- **Departments**:
  - Engineering: ~80
  - Marketing: ~40
  - Sales: ~40
  - Finance: ~20
  - Human Resources: ~20

- **Preferences**:
  - Tech: ~80
  - Business: ~60
  - Marketing: ~40
  - General: ~20

---

## ⚠️ Important Notes

### Data Privacy
- Never commit real subscriber data to public repositories
- Use `.gitignore` to exclude sensitive CSV files
- Comply with GDPR and data protection regulations
- Provide unsubscribe option in all emails

### Email Validation
- All emails are validated before sending
- Invalid emails are logged but not sent
- Check validation logs for issues

### File Size
- Keep CSV file under 1MB for best performance
- For larger lists, consider database integration

---

## 🔄 Updating Subscribers

### Add New Subscriber
1. Add row to CSV file
2. Run `npm run validate`
3. Test with `npm run test:local`
4. Deploy changes

### Remove Subscriber
1. Delete row from CSV file
2. Or comment out with `#` at start of line
3. Run `npm run validate`

### Update Subscriber Info
1. Edit the subscriber's row
2. Ensure email remains valid
3. Run `npm run validate`

---

## 🚨 Troubleshooting

### "No valid subscribers found"
- Check CSV file exists at `data/subscribers.csv`
- Verify CSV has header row
- Ensure at least one valid subscriber

### "Invalid email format"
- Check email addresses for typos
- Ensure proper format: `user@domain.com`
- Remove any spaces or special characters

### "Duplicate email"
- Search for duplicate email addresses
- Keep only one entry per email
- Use unique identifiers if needed

---

## 📞 Support

For issues with subscriber management:
1. Check validation output: `npm run validate`
2. Review error messages
3. Verify CSV format matches template
4. Test with small sample first

---

**Last Updated**: 2026-01-05
**Subscriber Count**: 200
