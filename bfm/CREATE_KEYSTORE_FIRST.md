# Create Android Debug Keystore First

The error "Keystore file does not exist" means you need to create the debug keystore before you can get the SHA-1 fingerprint.

---

## 🚀 Quick Solution: Create Keystore by Running Android App

The easiest way is to run your Expo app on Android - this automatically creates the keystore:

```bash
cd D:\forthlogic\buzzbreach\bfm
npx expo run:android
```

This will:
1. Create the debug keystore automatically
2. Build your app
3. Install and run it on Android emulator/device

**After this completes**, the keystore will exist and you can run the keytool command.

---

## 🔧 Alternative: Create Keystore Manually

If you can't run the app right now, create the keystore manually:

### Step 1: Create the .android directory (if it doesn't exist)

```powershell
# In PowerShell
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.android"
```

### Step 2: Generate the debug keystore

```powershell
keytool -genkey -v -keystore "$env:USERPROFILE\.android\debug.keystore" -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
```

**When prompted, just press Enter for all questions** (or fill them in - it doesn't matter for debug keystore).

### Step 3: Verify it was created

```powershell
Test-Path "$env:USERPROFILE\.android\debug.keystore"
```

Should return `True` if successful.

### Step 4: Now get the SHA-1

```powershell
keytool -list -v -keystore "$env:USERPROFILE\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android
```

---

## 📝 Complete PowerShell Commands (Copy & Paste)

Run these commands one by one in PowerShell:

```powershell
# 1. Create .android directory
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.android"

# 2. Generate debug keystore
keytool -genkey -v -keystore "$env:USERPROFILE\.android\debug.keystore" -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"

# 3. Get SHA-1 fingerprint
keytool -list -v -keystore "$env:USERPROFILE\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android
```

---

## ✅ After Creating the Keystore

Once the keystore exists, you can get the SHA-1 fingerprint using:

```powershell
keytool -list -v -keystore "$env:USERPROFILE\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android
```

Look for the line that says `SHA1:` and copy that value.

---

## 💡 Why This Happens

The debug keystore is created automatically when:
- You run an Android app for the first time
- You build an Android app with Android Studio
- You run `npx expo run:android`

If you haven't done any of these yet, the keystore won't exist.

---

## 🆘 Still Having Issues?

1. **Make sure Java is installed:**
   ```powershell
   java -version
   ```

2. **If keytool is not found, use full path:**
   ```powershell
   "C:\Program Files\Java\jdk-XX\bin\keytool.exe" -genkey -v -keystore "$env:USERPROFILE\.android\debug.keystore" -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
   ```
   Replace `XX` with your Java version.

3. **Check if the directory was created:**
   ```powershell
   Test-Path "$env:USERPROFILE\.android"
   ```
