# OAuth Quick Start Guide

## 🚀 Quick Setup Steps

### 1. Create `.env` File

Create a file named `.env` in the `bfm` folder with the following content:

```env
# Google OAuth Configuration
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-web-client-id-here.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-google-ios-client-id-here.apps.googleusercontent.com

# Facebook OAuth Configuration
EXPO_PUBLIC_FACEBOOK_APP_ID=your-facebook-app-id-here
```

**Replace the placeholder values with your actual credentials.**

### 2. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable **Google+ API** or **People API**
4. Go to **APIs & Services** → **OAuth consent screen** → Configure it
5. Go to **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth client ID**
6. Create a **Web application** client ID
7. Copy the **Client ID** and paste it in `.env` as `EXPO_PUBLIC_GOOGLE_CLIENT_ID`
8. (Optional) Create an **iOS** client ID and paste it as `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`

### 3. Get Facebook OAuth Credentials

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app → Select **Consumer** type
3. Add **Facebook Login** product
4. Go to **Settings** → **Basic**
5. Copy the **App ID** and paste it in `.env` as `EXPO_PUBLIC_FACEBOOK_APP_ID`
6. Go to **Facebook Login** → **Settings** → Add redirect URIs:
   - `exp://localhost:8081`
   - `exp://192.168.0.101:8081` (your local IP)

### 4. Restart Expo Server

After creating/updating `.env` file:

```bash
# Stop the current server (Ctrl+C)
# Then restart with cache cleared
npx expo start -c
```

### 5. Test OAuth

1. Open your app
2. Go to Login screen
3. Click "Sign in with Google" or "Sign in with Facebook"
4. Complete the OAuth flow

---

## 🍎 Apple Sign In Setup

**Note:** Apple Sign In is already configured in your app! You just need to enable it in Apple Developer Portal.

### Quick Setup:

1. **Go to Apple Developer Portal**
   - Visit: https://developer.apple.com/account/
   - Navigate to **Certificates, Identifiers & Profiles**

2. **Enable Sign In with Apple**
   - Find your App ID: `com.buzzbreach.app`
   - Edit it and enable **"Sign In with Apple"** capability
   - Save changes

3. **Build & Test**
   ```bash
   npx expo run:ios
   ```
   - **Important:** Apple Sign In does NOT work in Expo Go
   - You must create a development build

### What's Already Done:
- ✅ Package installed: `expo-apple-authentication`
- ✅ App.json configured: `usesAppleSignIn: true`
- ✅ Code implemented: `loginWithApple()` function
- ✅ Backend ready: `/user/auth/apple` endpoint

### For Detailed Instructions:
See **`APPLE_SIGN_IN_SETUP.md`** - Complete Apple Sign In guide

---

## 📖 Detailed Instructions

For complete step-by-step instructions with screenshots and troubleshooting, see:
- **`GOOGLE_FACEBOOK_OAUTH_SETUP.md`** - Google & Facebook OAuth guide
- **`APPLE_SIGN_IN_SETUP.md`** - Apple Sign In guide

---

## ⚠️ Important Notes

1. **Never commit `.env` file to git** - It's already in `.gitignore`
2. **Restart Expo server** after changing `.env` file
3. **Use `EXPO_PUBLIC_` prefix** for all environment variables
4. **Redirect URIs must match** in both Google Cloud Console and Facebook Developers
5. **For production**, update redirect URIs and credentials accordingly

---

## 🔍 Verify Configuration

Check that your credentials are loaded correctly:

1. Open `src/api/config.js`
2. The code should read from `process.env.EXPO_PUBLIC_*`
3. If you see `'YOUR_GOOGLE_CLIENT_ID'` in the app, the `.env` file is not being read

---

## 🆘 Troubleshooting

### Environment variables not loading?
- Make sure `.env` is in the `bfm` folder (root)
- Restart Expo server: `npx expo start -c`
- Check variable names start with `EXPO_PUBLIC_`

### OAuth not working?
- Check the detailed guide: `GOOGLE_FACEBOOK_OAUTH_SETUP.md`
- Verify redirect URIs are configured correctly
- Check console logs for error messages

### Apple Sign In not working?
- **Important:** Apple Sign In does NOT work in Expo Go
- Create a development build: `npx expo run:ios`
- Verify "Sign In with Apple" is enabled in Apple Developer Portal
- Check the detailed guide: `APPLE_SIGN_IN_SETUP.md`
