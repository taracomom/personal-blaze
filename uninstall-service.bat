@echo off
echo Personal Blaze - Service Uninstallation
echo =======================================
echo.

REM Check admin privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo This script requires administrator privileges.
    echo Right-click and select "Run as administrator"
    pause
    exit /b 1
)

echo Stopping and removing Personal Blaze Service...
echo.

REM Stop the service
sc stop "PersonalBlazeHelper"

REM Delete the service
sc delete "PersonalBlazeHelper"

echo.
echo ✅ Personal Blaze Helper service removed
echo.
pause