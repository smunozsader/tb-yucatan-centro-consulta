@echo off
REM Firebase Service Account Setup Helper
REM This script helps you set up your Firebase service account key

echo Setting up Firebase Service Account Key...
echo.

REM Check if FirebaseKeys directory exists
if not exist "%USERPROFILE%\FirebaseKeys" (
    echo Creating FirebaseKeys directory...
    mkdir "%USERPROFILE%\FirebaseKeys"
    echo ✓ Created: %USERPROFILE%\FirebaseKeys
) else (
    echo ✓ FirebaseKeys directory already exists
)

echo.
echo Next steps:
echo 1. Go to Google Cloud Console: https://console.cloud.google.com/
echo 2. Navigate to IAM ^& Admin → Service Accounts
echo 3. Create a new key and download the JSON file
echo 4. Save it as: %USERPROFILE%\FirebaseKeys\ceso-aphis-yuc-service-account.json
echo 5. Copy .env.example to .env and update the path
echo.

pause