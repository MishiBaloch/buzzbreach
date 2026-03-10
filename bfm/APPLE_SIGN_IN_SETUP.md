# Complete Guide: Apple Sign In Configuration for BuzzBreach

This comprehensive guide will walk you through setting up Apple Sign In (Sign in with Apple) for your BuzzBreach iOS application.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Apple Developer Portal Setup](#apple-developer-portal-setup)
4. [App Configuration](#app-configuration)
5. [Testing Apple Sign In](#testing-apple-sign-in)
6. [Important Notes & Limitations](#important-notes--limitations)
7. [Troubleshooting](#troubleshooting)

---

## 📖 Overview

Apple Sign In allows users to sign in to your app using their Apple ID. Unlike Google and Facebook OAuth, Apple Sign In:

- **Only works on iOS devices** (iOS 13+)
- **Does NOT require a Client ID** (uses native iOS authentication)
- **Requires Apple Developer account** and proper app configuration
- **Does NOT work in Expo Go** - requires a development build or production build

---

## ✅ Prerequisites

Before you begin, ensure you have:

1. **Apple Developer Account** (paid membership required - $99/year)
   - Sign up at: https://developer.apple.com/programs/
2. **Xcode installed** (for iOS development)
3. **Expo CLI** and development environment set up
4. **Physical iOS device** or **iOS Simulator** (iOS 13+)

---

## 🍎 Apple Developer Portal Setup

### Step 1: Sign In to Apple Developer Portal

1. **Go to Apple Developer Portal**
   - Visit: https://developer.apple.com/account/
   - Sign in with your Apple Developer account

### Step 2: Create or Select App ID

1. **Navigate to Certificates, Identifiers & Profiles**
   - Click on **"Certificates, Identifiers & Profiles"** in the left sidebar
   - Or go directly to: https://developer.apple.com/account/resources/identifiers/list

2. **Create or Edit App ID**
   - If you already have an App ID: Click on it to edit
   - If you need to create one: Click **"+"** button → Select **"App IDs"** → Click **"Continue"**

3. **Configure App ID**
   - **Description**: `BuzzBreach` (or your app name)
   - **Bundle ID**: `com.buzzbreach.app` (must match your `app.json`)
   - Select **"App"** as the type
   - Click **"Continue"** → **"Register"**

### Step 3: Enable Sign In with Apple Capability

1. **Edit Your App ID**
   - Find your App ID in the list (com.buzzbreach.app)
   - Click on it to edit

2. **Enable Sign In with Apple**
   - Scroll down to **"Capabilities"** section
   - Check the box for **"Sign In with Apple"**
   - Click **"Save"**
   - You may see a confirmation dialog - click **"Confirm"**

### Step 4: Configure Your App for Sign In with Apple

1. **Go to App Store Connect** (if you have an app registered)
   - Visit: https://appstoreconnect.apple.com/
   - This step is optional for development but required for App Store submission

2. **Configure App Information**
   - Ensure your app's bundle identifier matches: `com.buzzbreach.app`
   - Add app description and other required information

---

## ⚙️ App Configuration

### Step 1: Verify app.json Configuration

Your `app.json` should already be configured correctly. Verify these settings:

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.buzzbreach.app",
      "usesAppleSignIn": true
    },
    "plugins": [
      "expo-apple-authentication"
    ]
  }
}
```

**Current Status:**
- ✅ `usesAppleSignIn: true` - Already configured
- ✅ `expo-apple-authentication` plugin - Already added
- ✅ Bundle ID: `com.buzzbreach.app` - Already set

### Step 2: Verify Package Installation

The `expo-apple-authentication` package should already be installed. Verify:

```bash
cd bfm
npm list expo-apple-authentication
```

If not installed, install it:
```bash
npx expo install expo-apple-authentication
```

### Step 3: Code Implementation Status

Your code is already set up correctly:

- ✅ **authService.js**: `loginWithApple()` function implemented
- ✅ **Backend endpoint**: `/user/auth/apple` ready
- ✅ **Platform check**: Only loads on iOS devices
- ✅ **Error handling**: Handles cancellation and errors

---

## 🧪 Testing Apple Sign In

### Important: Testing Requirements

⚠️ **Apple Sign In has specific testing requirements:**

1. **Does NOT work in Expo Go**
   - You must create a development build or production build
   - Use: `npx expo run:ios` or EAS Build

2. **Requires iOS 13+**
   - Physical device: iOS 13.0 or later
   - iOS Simulator: iOS 13.0 or later

3. **Requires Apple Developer Account**
   - Free Apple ID won't work for testing
   - Need paid Apple Developer membership

### Step 1: Create Development Build

1. **Install iOS Dependencies**
   ```bash
   cd bfm
   npx expo prebuild --platform ios
   ```

2. **Run on iOS Simulator**
   ```bash
   npx expo run:ios
   ```
   
   Or run on a physical device:
   ```bash
   npx expo run:ios --device
   ```

### Step 2: Test Apple Sign In Flow

1. **Open Your App**
   - Launch the app on iOS Simulator or physical device
   - Navigate to the Login screen

2. **Tap "Sign in with Apple" Button**
   - The Apple Sign In modal should appear
   - You'll see options to:
     - **Continue** with your Apple ID
     - **Cancel** the sign-in

3. **Complete Sign In**
   - Tap **"Continue"**
   - Authenticate with Face ID, Touch ID, or passcode
   - Grant permission to share email/name (first time only)

4. **Verify Success**
   - You should be redirected back to your app
   - User should be logged in
   - Check backend logs to verify token was received

### Step 3: Test Edge Cases

1. **Test Cancellation**
   - Tap "Sign in with Apple"
   - Tap "Cancel"
   - App should handle cancellation gracefully

2. **Test on Different Devices**
   - Test on physical iPhone (recommended)
   - Test on iOS Simulator
   - Verify it works on different iOS versions (13+)

---

## ⚠️ Important Notes & Limitations

### 1. Email Availability

**Critical:** Apple may provide a **private relay email** instead of the real email:

- **First Sign In**: Apple provides the real email address
- **Subsequent Sign Ins**: Apple may provide a private relay email like `abc123@privaterelay.appleid.com`
- **Solution**: Always store the email on first sign-in, as you may not get it again

**Your backend already handles this correctly** - it stores the email from the first sign-in.

### 2. Name Availability

**Important:** User's name is only provided on the **first sign-in**:

- **First Sign In**: Full name (firstName, lastName) is provided
- **Subsequent Sign Ins**: Name is `null`
- **Solution**: Store the name on first sign-in (your backend already does this)

### 3. Platform Limitations

- **iOS Only**: Apple Sign In only works on iOS devices
- **No Web Support**: Cannot use Apple Sign In on web or Android
- **No Expo Go**: Requires development build or production build

### 4. User Experience

- **First Time**: User sees permission screen asking to share email/name
- **Subsequent Times**: Sign in is instant (uses Face ID/Touch ID)
- **Privacy**: Users can choose to "Hide My Email" - you'll get a private relay email

### 5. Backend Token Verification

Your backend should verify the `identityToken` from Apple:

- The token is a JWT that needs to be verified with Apple's public keys
- Your backend code in `bbm/corporate/user/controller.js` already handles this
- Make sure your backend verifies the token signature (currently using `jwt.decode` - consider using `jwt.verify` with Apple's public keys for production)

---

## 🔧 Troubleshooting

### Issue: "Apple Sign In is not available on this device"

**Possible Causes:**
1. iOS version is below 13.0
2. Device doesn't support Apple Sign In
3. App is running in Expo Go (not supported)

**Solutions:**
- Update iOS to 13.0 or later
- Use a development build: `npx expo run:ios`
- Test on a physical device or iOS Simulator with iOS 13+

### Issue: "Sign In with Apple" button doesn't appear

**Possible Causes:**
1. Capability not enabled in Apple Developer Portal
2. App not properly configured
3. Running in Expo Go

**Solutions:**
1. Verify in Apple Developer Portal:
   - Go to Certificates, Identifiers & Profiles
   - Select your App ID (com.buzzbreach.app)
   - Ensure "Sign In with Apple" capability is checked
   - Save changes

2. Rebuild the app:
   ```bash
   npx expo prebuild --clean
   npx expo run:ios
   ```

3. Verify app.json:
   - Check `usesAppleSignIn: true` is set
   - Check `expo-apple-authentication` plugin is in plugins array

### Issue: "Invalid bundle identifier" Error

**Possible Causes:**
1. Bundle ID mismatch between app.json and Apple Developer Portal
2. App ID not registered in Apple Developer Portal

**Solutions:**
1. Verify bundle ID matches:
   - `app.json`: `com.buzzbreach.app`
   - Apple Developer Portal: `com.buzzbreach.app`
   - They must match exactly

2. Register App ID in Apple Developer Portal if not already done

### Issue: Authentication Cancelled Error

**This is normal behavior** - users can cancel Apple Sign In. Your code already handles this:

```javascript
if (error.code === 'ERR_REQUEST_CANCELED') {
  return { success: false, error: 'Authentication cancelled' };
}
```

### Issue: Email is null on subsequent sign-ins

**This is expected behavior** - Apple only provides email on first sign-in. Your backend should:
- Store email on first sign-in
- Use stored email for subsequent sign-ins
- Handle private relay emails if user chose "Hide My Email"

### Issue: App crashes when tapping "Sign in with Apple"

**Possible Causes:**
1. Package not properly installed
2. Native code not built correctly
3. Missing entitlements

**Solutions:**
1. Reinstall package:
   ```bash
   npx expo install expo-apple-authentication
   ```

2. Clean and rebuild:
   ```bash
   npx expo prebuild --clean
   npx expo run:ios
   ```

3. Check Xcode project:
   - Open `ios/YourApp.xcworkspace` in Xcode
   - Go to Signing & Capabilities
   - Verify "Sign In with Apple" capability is added

---

## 📝 Checklist

Use this checklist to ensure everything is configured:

### Apple Developer Portal
- [ ] Apple Developer account (paid membership)
- [ ] App ID created: `com.buzzbreach.app`
- [ ] "Sign In with Apple" capability enabled
- [ ] App ID saved and confirmed

### App Configuration
- [ ] `expo-apple-authentication` package installed
- [ ] `app.json` has `usesAppleSignIn: true`
- [ ] `app.json` has `expo-apple-authentication` in plugins
- [ ] Bundle ID matches: `com.buzzbreach.app`

### Code Implementation
- [ ] `loginWithApple()` function implemented
- [ ] Backend endpoint `/user/auth/apple` working
- [ ] Error handling for cancellation
- [ ] Email/name stored on first sign-in

### Testing
- [ ] Development build created
- [ ] Tested on iOS Simulator (iOS 13+)
- [ ] Tested on physical device (recommended)
- [ ] Verified first sign-in works
- [ ] Verified subsequent sign-ins work
- [ ] Verified cancellation handling

---

## 🚀 Production Considerations

### Before App Store Submission

1. **Verify Token Verification**
   - Ensure backend verifies Apple identity tokens properly
   - Use Apple's public keys to verify JWT signature
   - Don't just decode - verify the signature

2. **Handle Private Relay Emails**
   - Users may choose "Hide My Email"
   - You'll receive emails like `abc123@privaterelay.appleid.com`
   - Design your system to handle these

3. **Test on Multiple Devices**
   - Test on various iPhone models
   - Test on iPad (if supporting)
   - Test on different iOS versions (13+)

4. **App Store Review**
   - Apple requires Sign In with Apple if you offer other social sign-in options
   - Ensure your implementation follows Apple's guidelines
   - Test thoroughly before submission

---

## 📚 Additional Resources

- [Apple Sign In Documentation](https://developer.apple.com/sign-in-with-apple/)
- [expo-apple-authentication Documentation](https://docs.expo.dev/versions/latest/sdk/apple-authentication/)
- [Apple Developer Portal](https://developer.apple.com/account/)
- [Human Interface Guidelines - Sign In with Apple](https://developer.apple.com/design/human-interface-guidelines/sign-in-with-apple)

---

## 🎯 Quick Reference

### Current Configuration Status

✅ **Already Configured:**
- Package installed: `expo-apple-authentication@~8.0.8`
- App.json: `usesAppleSignIn: true`
- Plugin: `expo-apple-authentication` added
- Code: `loginWithApple()` implemented
- Backend: `/user/auth/apple` endpoint ready

### What You Need to Do

1. **Apple Developer Portal:**
   - Enable "Sign In with Apple" capability for your App ID
   - Ensure bundle ID matches: `com.buzzbreach.app`

2. **Build & Test:**
   - Create development build: `npx expo run:ios`
   - Test on iOS Simulator or physical device
   - Verify sign-in flow works

3. **Production:**
   - Verify backend token verification
   - Test thoroughly before App Store submission

---

**Need Help?** If you encounter issues:
1. Check the troubleshooting section above
2. Verify all checklist items are completed
3. Check console logs for detailed error messages
4. Ensure you're using a development build (not Expo Go)
