@echo off
cd /d "%~dp0"
echo Personal Blaze - Service Installation
echo =====================================
echo.

net session >nul 2>&1
if %errorLevel% neq 0 (
    echo This script requires administrator privileges.
    echo Right-click and select "Run as administrator"
    echo.
    pause
    exit /b 1
)

echo Installing Personal Blaze as Windows Service...
echo.

sc create "PersonalBlazeHelper" binPath= "node.exe \"%~dp0personal-blaze-service.js\"" start= auto DisplayName= "Personal Blaze Helper Service"

sc start "PersonalBlazeHelper"

echo.
echo Personal Blaze Helper installed as Windows Service
echo Service will start automatically on Windows boot
echo No visible windows required
echo.
echo Service Status:
sc query "PersonalBlazeHelper"
echo.
pause