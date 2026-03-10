# Android Emulator Setup Guide

This guide will help you set up and use the Android emulator to preview your BuzzBreach app screens.

## Quick Start

1. **Run the setup script:**
   ```powershell
   .\setup-android-emulator.ps1
   ```

2. **If no AVD exists, create one:**
   - Open Android Studio
   - Go to **Tools → Device Manager**
   - Click **Create Device**
   - Select **Pixel 5** or **Pixel 6**
   - Select **API 33** or **API 34** (with Google Play)
   - Click **Finish**

3. **Run the app:**
   ```bash
   npm run android
   ```

## Manual Setup

### Step 1: Install Android Studio

1. Download from [developer.android.com/studio](https://developer.android.com/studio)
2. Run the installer
3. During setup, make sure to install:
   - Android SDK
   - Android SDK Platform
   - Android Virtual Device (AVD)

### Step 2: Create an Android Virtual Device (AVD)

1. Open **Android Studio**
2. Click **More Actions** → **Virtual Device Manager** (or **Tools → Device Manager**)
3. Click **Create Device** (or the **+** button)
4. Select a device:
   - **Pixel 5** (recommended)
   - **Pixel 6**
   - Or any other device
5. Click **Next**
6. Select a system image:
   - **API 33 (Android 13)** - Recommended
   - **API 34 (Android 14)**
   - Make sure it has **Google Play** icon (for Google services)
7. Click **Next**
8. Review settings and click **Finish**

### Step 3: Start the Emulator

**Option A: From Android Studio**
1. Open Android Studio
2. Go to **Device Manager**
3. Click the **▶️ Play** button next to your AVD
4. Wait for the emulator to boot (1-2 minutes)

**Option B: Using the Setup Script**
```powershell
.\setup-android-emulator.ps1
```

**Option C: Command Line**
```powershell
# List available AVDs
& "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe" -list-avds

# Start a specific AVD (replace AVD_NAME with your AVD name)
& "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe" -avd AVD_NAME
```

### Step 4: Run Your App

Once the emulator is running:

```bash
cd bfm
npm run android
```

Or:

```bash
npx expo start
# Then press 'a' for Android
```

## Environment Variables (Optional)

If you encounter issues, you may need to set these environment variables:

1. Open **System Properties** → **Environment Variables**
2. Add/Edit:
   - `ANDROID_HOME` = `C:\Users\YourUsername\AppData\Local\Android\Sdk`
   - Add to `PATH`:
     - `%ANDROID_HOME%\platform-tools`
     - `%ANDROID_HOME%\emulator`
     - `%ANDROID_HOME%\tools`

## Troubleshooting

### "adb not found" error
- Add Android SDK platform-tools to your PATH (see Environment Variables above)
- Or use the full path: `C:\Users\YourUsername\AppData\Local\Android\Sdk\platform-tools\adb.exe`

### Emulator won't start
- Make sure **Hyper-V** or **Windows Hypervisor Platform** is enabled in Windows Features
- Check that your CPU supports virtualization (Intel VT-x or AMD-V)
- Try creating a new AVD with different settings

### App won't install on emulator
- Make sure the emulator is fully booted (wait for the home screen)
- Check connection: `adb devices` should show your emulator
- Try restarting the emulator

### Slow emulator performance
- Allocate more RAM to the AVD (in AVD settings)
- Enable hardware acceleration
- Use a system image with fewer features (without Google Play if not needed)

### Expo can't find Android
- Make sure the emulator is running before running `npm run android`
- Check that `ANDROID_HOME` is set correctly
- Try: `npx expo start --android` explicitly

## Useful Commands

```powershell
# Check if emulator is running
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" devices

# List all AVDs
& "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe" -list-avds

# Kill all emulators
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" emu kill

# Restart ADB server
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" kill-server
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" start-server
```

## Next Steps

Once your emulator is running:
1. The app will automatically install and launch
2. You can see your screens in the emulator
3. Changes to your code will hot-reload automatically
4. Use Chrome DevTools for debugging: `http://localhost:19000/debugger`

## Need Help?

- Check the main [README.md](./README.md) for more information
- Expo documentation: [docs.expo.dev](https://docs.expo.dev)
- Android Studio help: [developer.android.com/studio](https://developer.android.com/studio)
