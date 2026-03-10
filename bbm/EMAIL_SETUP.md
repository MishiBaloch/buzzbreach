# Email Configuration Guide

## Password Reset Email Setup

The password reset feature requires email configuration. Follow these steps to set it up:

### Step 1: Add Email Configuration to `.env` File

Add these variables to your `bbm/.env` file:

```env
# Email Configuration (for password reset and notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
EMAIL_FROM="BuzzBreach" <your-email@gmail.com>

# Important: EMAIL_FROM sets the sender name that appears in emails
# Format: "Display Name" <email@example.com>
# This ensures emails show "BuzzBreach" instead of "me" or your email address

# Frontend URL (for reset password links)
FRONTEND_URL=http://localhost:3000
# or
APP_URL=http://localhost:3000
```

### Step 2: Gmail Setup (Recommended)

If using Gmail:

1. **Enable 2-Step Verification** on your Google account
2. **Generate an App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "BuzzBreach" as the name
   - Copy the 16-character password
   - Use this password as `EMAIL_HOST_PASSWORD` (not your regular Gmail password)

3. **Configuration**:
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_HOST_USER=your-email@gmail.com
   EMAIL_HOST_PASSWORD=xxxx xxxx xxxx xxxx  # The 16-char app password
   ```

### Step 3: Other Email Providers

#### Outlook/Hotmail:
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_HOST_USER=your-email@outlook.com
EMAIL_HOST_PASSWORD=your-password
```

#### Yahoo:
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_HOST_USER=your-email@yahoo.com
EMAIL_HOST_PASSWORD=your-app-password
```

#### Custom SMTP:
```env
EMAIL_HOST=your-smtp-server.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_HOST_USER=your-email@domain.com
EMAIL_HOST_PASSWORD=your-password
```

### Step 4: Verify Configuration

After adding the configuration:

1. Restart your backend server
2. Check the console logs - you should see:
   - `[Email] Transporter is ready to send emails` (if configured correctly)
   - OR `[Email] Transporter verification failed:` (if there's an issue)

### Step 5: Test Password Reset

1. Go to the Forgot Password screen in the app
2. Enter your email address
3. Check your email inbox for the reset link
4. If in DEV_MODE or email fails, check console logs for the reset token

### Troubleshooting

**Email not sending?**
- Check that all EMAIL_* variables are set in `.env`
- Verify your email credentials are correct
- For Gmail: Make sure you're using an App Password, not your regular password
- Check backend console logs for error messages
- In DEV_MODE, emails are logged to console instead of being sent

**"Transporter verification failed" error?**
- Double-check EMAIL_HOST, EMAIL_HOST_USER, and EMAIL_HOST_PASSWORD
- For Gmail: Ensure 2-Step Verification is enabled and you're using an App Password
- Check firewall/network settings
- Try a different email provider

**Email sent but not received?**
- Check spam/junk folder
- Verify the email address is correct
- Check email provider's sending limits
- Wait a few minutes (some providers have delays)

### Development Mode

If `DEV_MODE=true` or `KEYCLOAK_URL` is not set:
- Emails are NOT sent via SMTP
- Reset tokens are logged to console
- The app will show the reset token in the UI for testing

To enable email sending in development:
- Set `KEYCLOAK_URL` in `.env` (even if not using Keycloak)
- OR set `DEV_MODE=false`
- AND configure email settings as above
