# How to Get Android SHA-1 Certificate Fingerprint

This guide shows you how to get the SHA-1 certificate fingerprint needed for Google OAuth Android client ID configuration.

---

## 📍 Where to Run the Command

Run this command in your **Command Prompt** (cmd) or **PowerShell** or **Terminal**.

**On Windows:**
- Press `Win + R`
- Type `cmd` or `powershell`
- Press Enter
- Navigate to any directory (the keystore path is absolute, so location doesn't matter)

---

## 🔧 Windows Command

**For Windows, use this command:**

```bash
keytool -list -v -keystore %USERPROFILE%\.android\debug.keystore -alias androiddebugkey -storepass android -keypass android
```

**Or if you have Java in your PATH, you can use the full path:**

```bash
"C:\Program Files\Java\jdk-XX\bin\keytool.exe" -list -v -keystore %USERPROFILE%\.android\debug.keystore -alias androiddebugkey -storepass android -keypass android
```

**Replace `XX` with your Java version number (e.g., `jdk-17`, `jdk-11`, etc.)**

---

## 🍎 Mac/Linux Command

**For Mac or Linux, use this command:**

```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

---

## 📝 Step-by-Step Instructions

### Step 1: Open Command Prompt or PowerShell

1. **Windows:**
   - Press `Win + R`
   - Type `cmd` or `powershell`
   - Press Enter

2. **Mac:**
   - Open Terminal (Applications → Utilities → Terminal)

3. **Linux:**
   - Open Terminal

### Step 2: Run the Command

Copy and paste the appropriate command for your operating system (see above).

### Step 3: Find the SHA-1 Fingerprint

After running the command, you'll see output like this:

```
Alias name: androiddebugkey
Creation date: Jan 1, 2024
Entry type: PrivateKeyEntry
Certificate chain length: 1
Certificate[1]:
Owner: CN=Android Debug, O=Android, C=US
Issuer: CN=Android Debug, O=Android, C=US
Serial number: abc123def456
Valid from: Mon Jan 01 00:00:00 UTC 2024 until: Mon Jan 01 00:00:00 UTC 2054
Certificate fingerprints:
         SHA1: AA:BB:CC:DD:EE:FF:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE
         SHA256: 11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00
Signature algorithm name: SHA256withRSA
Subject Public Key Algorithm: 2048-bit RSA key
Version: 3
```

**Copy the SHA-1 value** (the one that looks like: `AA:BB:CC:DD:EE:FF:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE`)

### Step 4: Use in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Create or edit your **Android OAuth Client ID**
4. Paste the SHA-1 fingerprint in the **"SHA-1 certificate fingerprint"** field

---

## ⚠️ Troubleshooting

### Issue: "keytool is not recognized"

**Problem:** Java is not installed or not in your PATH.

**Solution:**

1. **Check if Java is installed:**
   ```bash
   java -version
   ```

2. **If Java is not installed:**
   - Download and install Java JDK from: https://www.oracle.com/java/technologies/downloads/
   - Or install Android Studio (which includes Java)

3. **If Java is installed but not in PATH:**
   - Find your Java installation (usually `C:\Program Files\Java\jdk-XX\bin\`)
   - Use the full path to keytool:
     ```bash
     "C:\Program Files\Java\jdk-XX\bin\keytool.exe" -list -v -keystore %USERPROFILE%\.android\debug.keystore -alias androiddebugkey -storepass android -keypass android
     ```

### Issue: "keystore file does not exist" or "Keystore file does not exist"

**Problem:** The debug keystore doesn't exist yet. This is the most common issue!

**Solution - Create the Keystore First:**

**Option 1: Create it by running Expo Android build (Easiest)**
```bash
cd D:\forthlogic\buzzbreach\bfm
npx expo run:android
```
This will:
- Create the debug keystore automatically
- Build and run your app on Android emulator/device
- After this completes, the keystore will exist and you can run the keytool command

**Option 2: Create it manually with keytool**
```bash
keytool -genkey -v -keystore %USERPROFILE%\.android\debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000
```

**Option 3: Use Android Studio**
1. Open Android Studio
2. Create a new Android project (or open existing)
3. Run the app once (this creates the debug keystore)

**After creating the keystore, then run:**
```bash
keytool -list -v -keystore %USERPROFILE%\.android\debug.keystore -alias androiddebugkey -storepass android -keypass android
```

**Note:** The keystore is created automatically when you:
- Run an Android app for the first time
- Build an Android app with Android Studio
- Run `npx expo run:android` for the first time

### Issue: "Access is denied" or Permission Error

**Solution:**

1. **Windows:** Run Command Prompt or PowerShell as Administrator
   - Right-click on Command Prompt → "Run as administrator"

2. **Mac/Linux:** Use `sudo` (if needed):
   ```bash
   sudo keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   ```

---

## 📍 Keystore File Locations

The debug keystore is located at:

- **Windows:** `C:\Users\YourUsername\.android\debug.keystore`
- **Mac:** `~/.android/debug.keystore` (which is `/Users/YourUsername/.android/debug.keystore`)
- **Linux:** `~/.android/debug.keystore` (which is `/home/YourUsername/.android/debug.keystore`)

---

## 🔍 Alternative: Get SHA-1 from Android Studio

1. Open **Android Studio**
2. Open your project
3. Click on **Gradle** tab (right side)
4. Navigate to: **YourApp** → **Tasks** → **android** → **signingReport**
5. Double-click **signingReport**
6. Check the **Run** tab at the bottom
7. Look for **SHA1:** value in the output

---

## 📝 Quick Reference

**Windows Command:**
```bash
keytool -list -v -keystore %USERPROFILE%\.android\debug.keystore -alias androiddebugkey -storepass android -keypass android
```

**Mac/Linux Command:**
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

**What to look for:**
- Find the line that says `SHA1:`
- Copy the value (format: `AA:BB:CC:DD:EE:FF:...`)
- Use it in Google Cloud Console when creating Android OAuth Client ID

---

## 💡 Note

- The **debug keystore** is used for development/testing
- For **production**, you'll need to get the SHA-1 from your **production keystore**
- The production keystore is created when you build a release version of your app

---

**Need Help?** If you still can't get the SHA-1:
1. Make sure you've run an Android app at least once (to create the keystore)
2. Verify Java is installed: `java -version`
3. Try using Android Studio's Gradle signingReport method (see above)
