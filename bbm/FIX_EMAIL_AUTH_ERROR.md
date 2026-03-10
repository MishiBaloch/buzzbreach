# Fix Gmail Authentication Error

## ❌ Current Error:
```
Invalid login: 535-5.7.8 Username and Password not accepted
Error code: EAUTH
```

## 🔍 Problem Identified:

From your terminal logs:
- `EMAIL_HOST_USER: myapp@gmail.com` ❌ (Wrong email)
- Email being sent to: `rimsha.mukhtiar2003@gmail.com` ✅ (Correct email)

**The EMAIL_HOST_USER must match the Gmail account you're using!**

---

## ✅ **SOLUTION - Fix Your `.env` File**

### Step 1: Open `bbm/.env` file

### Step 2: Update these values:

```env
# ❌ WRONG (Current):
EMAIL_HOST_USER=myapp@gmail.com

# ✅ CORRECT (Change to):
EMAIL_HOST_USER=rimsha.mukhtiar2003@gmail.com
```

### Step 3: Make sure you're using a Gmail App Password

**IMPORTANT:** You CANNOT use your regular Gmail password. You MUST use an App Password.

#### How to get a Gmail App Password:

1. **Go to:** https://myaccount.google.com/apppasswords
   - If you don't see this link, enable 2-Step Verification first

2. **Enable 2-Step Verification** (if not already enabled):
   - Go to: https://myaccount.google.com/security
   - Click "2-Step Verification" and follow the steps

3. **Generate App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select:
     - **App:** Mail
     - **Device:** Other (Custom name) → Enter "BuzzBreach"
   - Click **Generate**
   - Copy the **16-character password** (looks like: `abcd efgh ijkl mnop`)

4. **Update `.env`:**
   ```env
   EMAIL_HOST_PASSWORD=abcd efgh ijkl mnop
   ```
   - Remove spaces or keep them, both work
   - This is NOT your regular Gmail password!

---

## 📝 **Complete Correct `.env` Configuration:**

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_HOST_USER=rimsha.mukhtiar2003@gmail.com
EMAIL_HOST_PASSWORD=your-16-character-app-password
EMAIL_FROM="BuzzBreach" <rimsha.mukhtiar2003@gmail.com>

# Enable email sending (disable DEV_MODE)
KEYCLOAK_URL=https://keycloak.example.com
# OR
DEV_MODE=false
```

---

## 🔄 **After Updating:**

1. **Save the `.env` file**
2. **Restart your backend server:**
   - Stop: Press `Ctrl+C`
   - Start: `node server.js` or `npm start`

3. **Check the console** - You should see:
   ```
   [Email] Transporter is ready to send emails
   ```
   Instead of:
   ```
   [Email] Transporter verification failed
   ```

4. **Test password reset again**

---

## ⚠️ **Common Mistakes:**

1. ❌ Using regular Gmail password instead of App Password
2. ❌ EMAIL_HOST_USER doesn't match your actual Gmail account
3. ❌ 2-Step Verification not enabled
4. ❌ Copying App Password with extra spaces or missing characters
5. ❌ Not restarting server after changing `.env`

---

## ✅ **Verification Checklist:**

- [ ] EMAIL_HOST_USER = your actual Gmail address (`rimsha.mukhtiar2003@gmail.com`)
- [ ] EMAIL_HOST_PASSWORD = 16-character App Password (not regular password)
- [ ] 2-Step Verification is enabled on Gmail
- [ ] App Password was generated from https://myaccount.google.com/apppasswords
- [ ] Server restarted after updating `.env`
- [ ] Console shows: `[Email] Transporter is ready to send emails`

---

## 🎯 **Quick Fix:**

1. Change `EMAIL_HOST_USER=myapp@gmail.com` to `EMAIL_HOST_USER=rimsha.mukhtiar2003@gmail.com`
2. Make sure `EMAIL_HOST_PASSWORD` is a Gmail App Password (16 characters)
3. Restart server
4. Try again!

---

**Once fixed, you should receive OTP emails! 📧**
