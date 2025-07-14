@echo off
cd /d "%~dp0"
echo Personal Blaze Helper Service
echo =============================
echo.
echo Starting helper service for one-click updates...
echo.
echo This service enables instant AutoHotkey updates from the web manager.
echo Keep this window open while using Personal Blaze.
echo.

node personal-blaze-helper.js

echo.
echo Helper service stopped.
pause