# Qurbani Mobile APK Build Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Qurbani Mobile - APK Builder" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if EAS CLI is installed
Write-Host "Checking EAS CLI installation..." -ForegroundColor Yellow
$easInstalled = Get-Command eas -ErrorAction SilentlyContinue

if (-not $easInstalled) {
    Write-Host "❌ EAS CLI not found. Installing..." -ForegroundColor Red
    npm install -g eas-cli
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install EAS CLI. Please run: npm install -g eas-cli" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ EAS CLI installed successfully!" -ForegroundColor Green
}
else {
    Write-Host "✅ EAS CLI is installed" -ForegroundColor Green
}

Write-Host ""

# Check if user is logged in
Write-Host "Checking Expo login status..." -ForegroundColor Yellow
eas whoami 2>$null

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Not logged in to Expo" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please login to your Expo account:" -ForegroundColor Cyan
    Write-Host "If you don't have an account, sign up at: https://expo.dev/signup" -ForegroundColor Gray
    Write-Host ""
    
    eas login
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Login failed. Please try again." -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Logged in to Expo" -ForegroundColor Green
Write-Host ""

# Show build options
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Build Options" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "1. Preview APK (for testing - recommended)" -ForegroundColor White
Write-Host "2. Production AAB (for Google Play Store)" -ForegroundColor White
Write-Host "3. Development Build (with debugging)" -ForegroundColor White
Write-Host "4. Exit" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-4)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🚀 Building Preview APK..." -ForegroundColor Green
        Write-Host "This will create an APK you can install directly on Android devices" -ForegroundColor Gray
        Write-Host "Build time: approximately 10-20 minutes" -ForegroundColor Gray
        Write-Host ""
        eas build -p android --profile preview
    }
    "2" {
        Write-Host ""
        Write-Host "🚀 Building Production AAB..." -ForegroundColor Green
        Write-Host "This will create an app bundle for Google Play Store" -ForegroundColor Gray
        Write-Host "Build time: approximately 10-20 minutes" -ForegroundColor Gray
        Write-Host ""
        eas build -p android --profile production
    }
    "3" {
        Write-Host ""
        Write-Host "🚀 Building Development Build..." -ForegroundColor Green
        Write-Host "This includes debugging tools and dev features" -ForegroundColor Gray
        Write-Host "Build time: approximately 10-20 minutes" -ForegroundColor Gray
        Write-Host ""
        eas build -p android --profile development
    }
    "4" {
        Write-Host "Exiting..." -ForegroundColor Yellow
        exit 0
    }
    default {
        Write-Host "❌ Invalid choice. Please run the script again." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Build Started!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📱 Your build is now in progress on Expo's servers" -ForegroundColor Green
Write-Host "⏱️  This typically takes 10-20 minutes" -ForegroundColor Yellow
Write-Host "🔗 You can check build status at: https://expo.dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "When the build completes:" -ForegroundColor White
Write-Host "  1. Download the APK from the link provided above" -ForegroundColor Gray
Write-Host "  2. Transfer to your Android device" -ForegroundColor Gray
Write-Host "  3. Install and test!" -ForegroundColor Gray
Write-Host ""
Write-Host "💡 Tip: You can close this terminal. The build continues in the cloud." -ForegroundColor Yellow
Write-Host ""
