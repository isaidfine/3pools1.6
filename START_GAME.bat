@echo off
echo Starting Antigravity Game Server...
cd /d "%~dp0"
echo Server will start at: http://localhost:5176
echo Please do not close this window while playing.
npm run dev -- --host --port 5176
pause
