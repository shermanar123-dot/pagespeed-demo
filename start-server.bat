@echo off
cd /d "%~dp0"
where npm >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed or not on PATH. Install it from https://nodejs.org then run this again.
  pause
  exit /b 1
)
echo Starting Website Speed Check demo... keep this window open.
start "" cmd /c "timeout /t 3 >nul & start http://localhost:3000"
call npm start
echo.
echo The server stopped. See any error above.
pause
