@echo off
cd /d "%~dp0"
echo Personal Blaze Helper Service
echo =============================
echo.
echo Starting helper service in background...
echo.

start /b "" node personal-blaze-service.js

echo Helper service started in background.
echo The service is now running invisibly.
timeout /t 2 /nobreak >nul