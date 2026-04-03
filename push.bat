@echo off
echo === Campus Flow - Auto Commit & Push ===
cd /d "c:\Users\aksha\.gemini\antigravity\scratch\campus-flow"

"C:\Program Files\Git\bin\git.exe" add .

set /p msg="Enter commit message (or press Enter for default): "
if "%msg%"=="" set msg=Update campus-flow project

"C:\Program Files\Git\bin\git.exe" commit -m "%msg%"
"C:\Program Files\Git\bin\git.exe" push origin main

echo.
echo === Done! Check above for success or errors ===
pause
