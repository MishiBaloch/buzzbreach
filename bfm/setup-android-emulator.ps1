# Android Emulator Setup Script for BuzzBreach
# This script helps you set up and start the Android emulator

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Android Emulator Setup for BuzzBreach" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Android SDK
$androidSdkPath = "$env:LOCALAPPDATA\Android\Sdk"
if (Test-Path $androidSdkPath) {
    Write-Host "✓ Android SDK found at: $androidSdkPath" -ForegroundColor Green
} else {
    Write-Host "✗ Android SDK not found!" -ForegroundColor Red
    Write-Host "  Please install Android Studio from: https://developer.android.com/studio" -ForegroundColor Yellow
    exit 1
}

# Check ADB
$adbPath = "$androidSdkPath\platform-tools\adb.exe"
if (Test-Path $adbPath) {
    Write-Host "✓ ADB found" -ForegroundColor Green
} else {
    Write-Host "✗ ADB not found!" -ForegroundColor Red
    exit 1
}

# Check Emulator
$emulatorPath = "$androidSdkPath\emulator\emulator.exe"
if (Test-Path $emulatorPath) {
    Write-Host "✓ Android Emulator found" -ForegroundColor Green
} else {
    Write-Host "✗ Android Emulator not found!" -ForegroundColor Red
    Write-Host "  Please install Android Emulator through Android Studio SDK Manager" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Checking for available Android Virtual Devices (AVDs)..." -ForegroundColor Cyan
$avds = & $emulatorPath -list-avds

if ($avds.Count -eq 0 -or $avds -eq "") {
    Write-Host ""
    Write-Host "⚠ No AVDs found!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To create an AVD:" -ForegroundColor Cyan
    Write-Host "1. Open Android Studio" -ForegroundColor White
    Write-Host "2. Go to Tools -> Device Manager" -ForegroundColor White
    Write-Host "3. Click Create Device" -ForegroundColor White
    Write-Host "4. Select a device like Pixel 5 or Pixel 6" -ForegroundColor White
    Write-Host "5. Select a system image - API 33 or 34 with Google Play recommended" -ForegroundColor White
    Write-Host "6. Click Finish" -ForegroundColor White
    Write-Host ""
    Write-Host "After creating an AVD, run this script again to start it." -ForegroundColor Yellow
    exit 1
} else {
    Write-Host ""
    Write-Host "Available AVDs:" -ForegroundColor Green
    $index = 1
    foreach ($avd in $avds) {
        Write-Host "  $index. $avd" -ForegroundColor White
        $index++
    }
    Write-Host ""
    
    # Check if any emulator is already running
    $runningDevices = & "$androidSdkPath\platform-tools\adb.exe" devices
    $isRunning = $runningDevices -match 'emulator'
    
    if ($isRunning) {
        Write-Host "✓ An emulator is already running!" -ForegroundColor Green
        Write-Host ""
        Write-Host "You can now run your app with:" -ForegroundColor Cyan
        Write-Host "  npm run android" -ForegroundColor White
        Write-Host "  or" -ForegroundColor White
        Write-Host "  npx expo start --android" -ForegroundColor White
    } else {
        Write-Host "Starting the first available emulator..." -ForegroundColor Cyan
        Write-Host "  This may take a minute or two" -ForegroundColor Yellow
        Write-Host ""
        
        # Start the first AVD in the background
        $firstAvd = $avds[0]
        Write-Host "Starting: $firstAvd" -ForegroundColor White
        Start-Process -FilePath $emulatorPath -ArgumentList "-avd", $firstAvd -WindowStyle Normal
        
        Write-Host ""
        Write-Host "⏳ Waiting for emulator to boot..." -ForegroundColor Yellow
        Write-Host "   This can take 1-2 minutes" -ForegroundColor Yellow
        Write-Host ""
        
        # Wait for emulator to be ready
        $maxAttempts = 60
        $attempt = 0
        $ready = $false
        
        while ($attempt -lt $maxAttempts -and -not $ready) {
            Start-Sleep -Seconds 2
            $devices = & "$androidSdkPath\platform-tools\adb.exe" devices
            if ($devices -match 'emulator.*device') {
                $ready = $true
                Write-Host "✓ Emulator is ready!" -ForegroundColor Green
            } else {
                $attempt++
                Write-Host "." -NoNewline -ForegroundColor Gray
            }
        }
        
        Write-Host ""
        if ($ready) {
            Write-Host ""
            Write-Host "========================================" -ForegroundColor Green
            Write-Host "Emulator is ready!" -ForegroundColor Green
            Write-Host "========================================" -ForegroundColor Green
            Write-Host ""
            Write-Host "You can now run your app with:" -ForegroundColor Cyan
            Write-Host "  npm run android" -ForegroundColor White
            Write-Host ""
        } else {
            Write-Host ""
            Write-Host "⚠ Emulator is starting but not ready yet." -ForegroundColor Yellow
            Write-Host "  Please wait for it to fully boot, then run:" -ForegroundColor Yellow
            Write-Host "  npm run android" -ForegroundColor White
        }
    }
}

Write-Host ""
Write-Host "Tip: You can also start emulators manually from Android Studio" -ForegroundColor Gray
