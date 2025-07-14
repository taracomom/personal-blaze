@echo off
cd /d "%~dp0"
echo Personal Blaze - Startup Installation
echo =====================================
echo.
echo Installing Personal Blaze to startup...
echo.

REM Copy helper service to startup
copy "start-helper.bat" "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\start-helper.bat"

REM Copy current AutoHotkey script to startup
copy "personal-blaze.ahk" "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\personal-blaze.ahk"

echo.
echo ✅ Installation complete!
echo.
echo Personal Blaze will now:
echo - Start automatically when Windows boots
echo - Enable one-click updates from the web manager
echo.
echo Web Manager: https://taracomom.github.io/personal-blaze/
echo.
pause