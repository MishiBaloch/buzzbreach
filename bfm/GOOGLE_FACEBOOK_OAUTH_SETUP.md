# Complete Guide: Google & Facebook OAuth Configuration for BuzzBreach

This comprehensive guide will walk you through setting up Google and Facebook OAuth authentication step-by-step.

---

## 📋 Table of Contents

1. [Google OAuth Setup](#google-oauth-setup)
2. [Facebook OAuth Setup](#facebook-oauth-setup)
3. [Environment Variables Configuration](#environment-variables-configuration)
4. [Testing OAuth](#testing-oauth)
5. [Troubleshooting](#troubleshooting)

---

## 🔵 Google OAuth Setup

### Step 1: Create a Google Cloud Project

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create a New Project**
   - Click the project dropdown at the top (next to "Google Cloud")
   - Click **"New Project"**
   - Enter project name: `BuzzBreach` (or any name you prefer)
   - Click **"Create"**
   - Wait for the project to be created (usually takes a few seconds)

3. **Select Your Project**
   - Click the project dropdown again
   - Select the project you just created

### Step 2: Enable Google APIs

1. **Navigate to APIs & Services**
   - In the left sidebar, click **"APIs & Services"** → **"Library"**
   - Or go directly to: https://console.cloud.google.com/apis/library

2. **Enable Required APIs**
   - Search for and enable these APIs:
     - **Google+ API** (or **People API** - recommended)
     - **Google Identity Services API**

3. **Enable the API**
   - Click on the API from the results
   - Click the **"Enable"** button
   - Wait for it to be enabled (usually instant)

### Step 3: Configure OAuth Consent Screen

1. **Go to OAuth Consent Screen**
   - In the left sidebar, click **"APIs & Services"** → **"OAuth consent screen"**
   - Or go directly to: https://console.cloud.google.com/apis/credentials/consent

2. **Choose User Type**
   - Select **"External"** (unless you have a Google Workspace account)
   - Click **"Create"**

3. **Fill in App Information**
   - **App name**: `BuzzBreach` (or your app name)
   - **User support email**: Your email address
   - **App logo**: (Optional) Upload your app logo
   - **App domain**: (Optional) Your website domain
   - **Developer contact information**: Your email address
   - Click **"Save and Continue"**

4. **Configure Scopes**
   - Click **"Add or Remove Scopes"**
   - Add these scopes:
     - `openid`
     - `profile`
     - `email`
   - Click **"Update"**
   - Click **"Save and Continue"**

5. **Add Test Users** (if app is in Testing mode)
   - Add email addresses of users who can test the app
   - Click **"Save and Continue"**

6. **Review and Submit**
   - Review your settings
   - Click **"Back to Dashboard"**

### Step 4: Create OAuth 2.0 Client IDs

1. **Go to Credentials**
   - In the left sidebar, click **"APIs & Services"** → **"Credentials"**
   - Or go directly to: https://console.cloud.google.com/apis/credentials

2. **Create Web Application Client ID** (Primary - used for Android/Web)
   - Click **"+ Create Credentials"**
   - Select **"OAuth client ID"**

3. **Configure Web Application**
   - **Application type**: Select **"Web application"**
   - **Name**: `BuzzBreach Web Client`
   - **Authorized JavaScript origins**: 
     - ⚠️ **IMPORTANT**: Only add HTTPS URLs here (Google doesn't accept custom schemes like `exp://`)
     - Add: `https://auth.expo.io`
     - **DO NOT add** `exp://` URLs here - they will be rejected!
   - **Authorized redirect URIs**:
     - ✅ Add: `https://auth.expo.io/@mishi03/buzzbreach` (primary - required, using your Expo username)
     - ✅ Add: `exp://localhost:8081` (for local development - may work)
     - ❌ **DO NOT add**: `exp://192.168.142.104:8081` or any IP-based `exp://` URLs
     - **Important**: Google rejects `exp://` URLs with IP addresses. Only use:
       - HTTPS URLs (like `https://auth.expo.io/@mishi03/buzzbreach`)
       - `exp://localhost:8081` (may work, but not guaranteed)
   - Click **"Create"**
   - **IMPORTANT**: Copy the **Client ID** immediately (you'll need this)
   - It will look like: `123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com`

4. **Create iOS Client ID** (Optional but Recommended)
   - Click **"+ Create Credentials"** again
   - Select **"OAuth client ID"**
   - **Application type**: Select **"iOS"**
   - **Name**: `BuzzBreach iOS Client`
   - **Bundle ID**: `com.buzzbreach.app` (must match your app.json)
   - Click **"Create"**
   - Copy the **iOS Client ID**

5. **Create Android Client ID** (Optional)
   - Click **"+ Create Credentials"** again
   - Select **"OAuth client ID"**
   - **Application type**: Select **"Android"**
   - **Name**: `BuzzBreach Android Client`
   - **Package name**: `com.buzzbreach.app` (must match your app.json)
   - **SHA-1 certificate fingerprint**: 
     - **Windows**: Run in Command Prompt or PowerShell:
       ```bash
       keytool -list -v -keystore %USERPROFILE%\.android\debug.keystore -alias androiddebugkey -storepass android -keypass android
       ```
     - **Mac/Linux**: Run in Terminal:
       ```bash
       keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
       ```
     - Look for the `SHA1:` value in the output and copy it
     - **Note**: See `GET_ANDROID_SHA1.md` for detailed instructions and troubleshooting
     - For production: Get from your production keystore
   - Click **"Create"**
   - Copy the **Android Client ID**

### Step 5: Get Your Client IDs

After creating the credentials, you'll see them listed. You need:
- **Web Client ID**: Primary ID (use this for Android/Web)
- **iOS Client ID**: For iOS (if you created one, otherwise use Web Client ID)

**Note**: For Expo apps, you can use the Web Client ID for all platforms, but having platform-specific IDs is recommended for better security.

---

## 🔵 Facebook OAuth Setup

### Step 1: Create a Facebook App

1. **Go to Facebook Developers**
   - Visit: https://developers.facebook.com/
   - Sign in with your Facebook account

2. **Verify Your Developer Account** (First Time Only)
   
   ⚠️ **If you see "Verify Your Account" step:**
   
   **Option A: Verify with Mobile Number**
   - Enter your mobile number
   - If you get error "Sorry, a temporary error has occurred":
     - **Wait 10-15 minutes** and try again (Facebook may have rate limiting)
     - **Try a different mobile number** if available
     - **Clear browser cache** and try again
     - **Use a different browser** (Chrome, Firefox, Edge)
   
   **Option B: Verify with Credit Card** (Recommended if mobile fails)
   - Click **"You can also verify your account by adding a credit card"** link
   - Add a credit card (Facebook doesn't charge, just verifies)
   - This is often more reliable than mobile verification
   
   **Option C: Skip for Now** (If possible)
   - Some accounts allow skipping verification temporarily
   - You can verify later if needed
   - Basic app creation may still work without verification

3. **Create a New App**
   - Click **"My Apps"** in the top right
   - Click **"Create App"**
   - Select **"Consumer"** as the app type
   - Click **"Next"**

3. **Fill in App Details**
   - **App name**: `BuzzBreach` (or your app name)
   - **App contact email**: Your email address
   - **Business account**: (Optional) Select if you have one
   - Click **"Create App"**
   - Complete the security check if prompted

### Step 2: Add Facebook Login Product

1. **Add Facebook Login**
   - In your app dashboard, find **"Add a Product"** or go to **"Products"** in the left sidebar
   - Find **"Facebook Login"** and click **"Set Up"**
   - Select **"Web"** as the platform (for Expo apps)

2. **Configure Facebook Login Settings**
   - In the left sidebar, click **"Facebook Login"** → **"Settings"**
   - **Valid OAuth Redirect URIs**: Add these:
     - `https://auth.expo.io/@mishi03/buzzbreach` (your Expo username: mishi03)
     - `exp://localhost:8081` (optional - for local development)
     - **Note**: IP-based URLs may not work reliably, use the HTTPS Expo URL
   - Click **"Save Changes"**

### Step 3: Configure App Settings

1. **Go to App Settings**
   - In the left sidebar, click **"Settings"** → **"Basic"**

2. **Get Your App ID and App Secret**
   - **App ID**: This is your Facebook App ID (you'll need this)
   - **App Secret**: Click **"Show"** to reveal it (you may need this for backend)
   - **App Domains**: Add your domain (optional for mobile apps)

3. **Add Platform - iOS** (Optional but Recommended)
   - Scroll down to **"Platform"** section
   - Click **"Add Platform"** → Select **"iOS"**
   - **Bundle ID**: `com.buzzbreach.app` (must match your app.json)
   - Click **"Save Changes"**

4. **Add Platform - Android** (Optional)
   - Click **"Add Platform"** → Select **"Android"**
   - **Package Name**: `com.buzzbreach.app` (must match your app.json)
   - **Class Name**: `com.buzzbreach.MainActivity` (default)
   - **Key Hashes**: (Optional) Add your Android key hash
   - Click **"Save Changes"**

### Step 4: Configure Permissions

1. **Go to App Review** (if needed)
   - For basic permissions like `email` and `public_profile`, you may not need app review
   - For advanced permissions, you'll need to submit for review

2. **Basic Permissions** (Available by default):
   - `public_profile` - User's public profile information
   - `email` - User's email address

### Step 5: Get Your App ID

- **App ID**: Found in **"Settings"** → **"Basic"**
- It will look like: `1234567890123456`
- This is what you need for your mobile app

---

## ⚙️ Environment Variables Configuration

### Step 1: Create .env File

1. **Create `.env` file in the `bfm` folder**
   - Location: `D:\forthlogic\buzzbreach\bfm\.env`

2. **Add your OAuth credentials**

```env
# Google OAuth Configuration
# Get from: Google Cloud Console → APIs & Services → Credentials
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-web-client-id-here.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-google-ios-client-id-here.apps.googleusercontent.com

# Facebook OAuth Configuration
# Get from: Facebook Developers → Your App → Settings → Basic
EXPO_PUBLIC_FACEBOOK_APP_ID=your-facebook-app-id-here

# Example:
# EXPO_PUBLIC_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
# EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=987654321-zyxwvutsrqponmlkjihgfedcba.apps.googleusercontent.com
# EXPO_PUBLIC_FACEBOOK_APP_ID=1234567890123456
```

### Step 2: Install dotenv (if not already installed)

```bash
cd bfm
npm install dotenv
```

### Step 3: Update Your Code to Use Environment Variables

The code in `src/api/config.js` already reads from environment variables using `process.env.EXPO_PUBLIC_*`. Make sure your `.env` file is in the `bfm` folder.

**Important Notes:**
- Expo requires the `EXPO_PUBLIC_` prefix for environment variables to be accessible in the app
- Restart your Expo development server after adding/updating `.env` file
- Never commit `.env` file to git (it should be in `.gitignore`)

### Step 4: Verify Configuration

Check that `src/api/config.js` is correctly reading the environment variables:

```javascript
export const OAUTH_CONFIG = {
  GOOGLE: {
    CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
    IOS_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || 'YOUR_GOOGLE_IOS_CLIENT_ID',
  },
  FACEBOOK: {
    APP_ID: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID || 'YOUR_FACEBOOK_APP_ID',
  },
};
```

---

## 🧪 Testing OAuth

### Prerequisites

1. **Backend Server Running**
   ```bash
   cd bbm
   npm start
   ```
   - Make sure your backend is running on the correct port (default: 5000)
   - Verify the OAuth endpoints are working:
     - `POST /api/v1/user/auth/google`
     - `POST /api/v1/user/auth/facebook`

2. **Frontend App Running**
   ```bash
   cd bfm
   npm start
   ```

### Testing Google OAuth

1. **Open your app** in Expo Go or development build
2. **Navigate to Login Screen**
3. **Click "Sign in with Google" button**
4. **Expected Flow**:
   - Google account picker should appear
   - Select a Google account
   - Grant permissions if prompted
   - You should be redirected back to your app
   - You should be logged in successfully

5. **Check Console Logs**:
   - Look for any error messages
   - Verify the ID token is being sent to your backend

### Testing Facebook OAuth

1. **Open your app** in Expo Go or development build
2. **Navigate to Login Screen**
3. **Click "Sign in with Facebook" button**
4. **Expected Flow**:
   - Facebook login page should appear (in browser or in-app browser)
   - Enter Facebook credentials
   - Grant permissions
   - You should be redirected back to your app
   - You should be logged in successfully

5. **Check Console Logs**:
   - Look for any error messages
   - Verify the access token is being sent to your backend

### Common Issues During Testing

1. **"OAuth not configured" error**:
   - Check that `.env` file exists and has correct values
   - Restart Expo development server
   - Verify environment variables are being read correctly

2. **"Invalid client ID" error**:
   - Double-check the Client ID/App ID in `.env` file
   - Make sure there are no extra spaces or quotes
   - Verify the credentials in Google Cloud Console / Facebook Developers

3. **Redirect URI mismatch**:
   - Check that redirect URIs in Google Cloud Console / Facebook match your app's scheme
   - For Expo: Use `exp://localhost:8081` or your custom scheme

---

## 🔧 Troubleshooting

### Google OAuth Issues

#### Issue: "redirect_uri_mismatch" Error

**Solution:**
1. Go to Google Cloud Console → Credentials
2. Edit your OAuth 2.0 Client ID
3. Add these to **Authorized redirect URIs** (NOT JavaScript origins):
   - `https://auth.expo.io/@mishi03/buzzbreach` (primary - your Expo username: mishi03)
   - `exp://localhost:8081` (if Google accepts it)
   - **Note**: IP-based `exp://` URLs (like `exp://192.168.142.104:8081`) may not be accepted by Google
4. In **Authorized JavaScript origins**, only add:
   - `https://auth.expo.io`
5. Save and wait a few minutes for changes to propagate

#### Issue: "invalid_client" Error

**Solution:**
1. Verify your Client ID is correct in `.env` file
2. Make sure you're using the Web Client ID (not iOS/Android specific)
3. Check that the Client ID doesn't have extra spaces or quotes

#### Issue: OAuth Consent Screen Not Configured

**Solution:**
1. Go to Google Cloud Console → OAuth consent screen
2. Complete all required fields
3. Add test users if app is in "Testing" mode
4. Submit for verification if needed

#### Issue: "Invalid Redirect: must end with a public top-level domain" Error

**Problem:** You're trying to add `exp://192.168.142.104:8081` to "Authorized redirect URIs" and Google is rejecting it.

**Why this happens:**
- Google Cloud Console **does NOT accept** `exp://` URLs with IP addresses (like `exp://192.168.142.104:8081`)
- Google only accepts:
  - HTTPS URLs with public domains (like `https://auth.expo.io/...`)
  - `exp://localhost:8081` (sometimes, but not guaranteed)

**Solution:**
1. **Remove the IP-based URL** from "Authorized redirect URIs":
   - ❌ Remove: `exp://192.168.142.104:8081`
   - ❌ Remove: Any other `exp://` URLs with IP addresses

2. **Add only these URLs** to "Authorized redirect URIs":
   - ✅ `https://auth.expo.io/@mishi03/buzzbreach` (your Expo username: mishi03)
   - ✅ `exp://localhost:8081` (optional - for local development, may work)

3. **For "Authorized JavaScript origins"**, add only:
   - ✅ `https://auth.expo.io`

4. **How Expo OAuth works:**
   - Expo's AuthSession uses `https://auth.expo.io` as the redirect handler
   - This HTTPS URL redirects back to your app automatically
   - You don't need IP-based `exp://` URLs - the HTTPS URL handles everything

5. **For local development:**
   - Use `exp://localhost:8081` if Google accepts it
   - If not, the HTTPS redirect URL will still work for development
   - The Expo AuthSession library handles the redirect automatically

### Facebook OAuth Issues

#### Issue: "Sorry, a temporary error has occurred" During Account Verification

**Problem:** Facebook shows error when trying to verify account with mobile number.

**Solutions (try in order):**

1. **Wait and Retry:**
   - Wait 10-15 minutes (Facebook may have rate limiting)
   - Clear browser cache and cookies
   - Try again with the same mobile number

2. **Use Credit Card Verification (Recommended):**
   - Click the link "You can also verify your account by adding a credit card"
   - Add a credit card (Facebook doesn't charge, just verifies identity)
   - This method is often more reliable than mobile verification
   - You can remove the card after verification if desired

3. **Try Different Browser:**
   - Switch to Chrome, Firefox, or Edge
   - Sometimes browser-specific issues cause this error

4. **Try Different Mobile Number:**
   - If you have access to another mobile number, try that
   - Make sure the number can receive SMS

5. **Check Facebook Account Status:**
   - Make sure your Facebook account is in good standing
   - Verify your Facebook account email is confirmed
   - Check if your account has any restrictions

6. **Contact Facebook Support:**
   - If all else fails, contact Facebook Developer Support
   - Go to: https://developers.facebook.com/support/

#### Issue: "Invalid App ID" Error

**Solution:**
1. Verify your App ID in `.env` file
2. Check Facebook Developers → Settings → Basic
3. Make sure the App ID is correct (no extra spaces)

#### Issue: "Redirect URI Mismatch" Error

**Solution:**
1. Go to Facebook Developers → Facebook Login → Settings
2. Add these to **Valid OAuth Redirect URIs**:
   - `https://auth.expo.io/@mishi03/buzzbreach` (your Expo username)
   - `exp://localhost:8081`
   - **Note**: IP-based URLs may not work, use the HTTPS Expo URL
3. Save changes

#### Issue: App Not Available for All Users

**Solution:**
1. Go to Facebook Developers → App Review
2. If your app is in "Development" mode, add test users
3. Or submit your app for review to make it public

#### Issue: Cannot Create App - Account Not Verified

**Solution:**
1. Complete account verification first (see above)
2. Use credit card verification if mobile fails
3. Make sure your Facebook account email is verified
4. Check that your account doesn't have restrictions

### General Issues

#### Issue: Environment Variables Not Loading

**Solution:**
1. Make sure `.env` file is in the `bfm` folder (root of your Expo project)
2. Restart Expo development server completely
3. Clear cache: `npx expo start -c`
4. Verify variable names start with `EXPO_PUBLIC_`

#### Issue: OAuth Works in Development but Not in Production

**Solution:**
1. For Google: Make sure production redirect URIs are added
2. For Facebook: Add production redirect URIs
3. Update `.env` file with production credentials if different
4. Rebuild your app: `npx expo build:ios` or `npx expo build:android`

---

## 📝 Quick Reference

### Google OAuth Checklist

- [ ] Google Cloud Project created
- [ ] Google+ API or People API enabled
- [ ] OAuth consent screen configured
- [ ] Web Application OAuth Client ID created
- [ ] iOS OAuth Client ID created (optional)
- [ ] Client IDs added to `.env` file
- [ ] Redirect URIs configured in Google Cloud Console

### Facebook OAuth Checklist

- [ ] Facebook App created
- [ ] Facebook Login product added
- [ ] App ID obtained
- [ ] Redirect URIs configured
- [ ] iOS platform added (optional)
- [ ] Android platform added (optional)
- [ ] App ID added to `.env` file

### Environment Variables Checklist

- [ ] `.env` file created in `bfm` folder
- [ ] `EXPO_PUBLIC_GOOGLE_CLIENT_ID` set
- [ ] `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` set (optional)
- [ ] `EXPO_PUBLIC_FACEBOOK_APP_ID` set
- [ ] `.env` added to `.gitignore`
- [ ] Expo server restarted after changes

---

## 🎯 Next Steps

After completing the setup:

1. **Test OAuth flows** on both iOS and Android
2. **Test on physical devices** (not just simulators)
3. **Configure production credentials** when ready to deploy
4. **Set up backend OAuth verification** (if not already done)
5. **Add error handling** for OAuth failures
6. **Test edge cases** (cancelled auth, network errors, etc.)

---

## 📚 Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login/)
- [Expo AuthSession Documentation](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)

---

**Need Help?** If you encounter issues not covered here, check:
1. Console logs for detailed error messages
2. Google Cloud Console / Facebook Developers for configuration issues
3. Backend logs to see if tokens are being received correctly
