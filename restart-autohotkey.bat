@echo off
echo Restarting Personal Blaze...
echo.

REM Kill existing AutoHotkey processes
taskkill /f /im AutoHotkey.exe 2>nul

REM Wait a moment
timeout /t 2 /nobreak >nul

REM Start AutoHotkey
echo Starting AutoHotkey...
"%PROGRAMFILES%\AutoHotkey\v2\AutoHotkey.exe" "%~dp0personal-blaze.ahk"

echo.
echo Personal Blaze restarted!
echo Check the system tray for the AutoHotkey icon.
pause