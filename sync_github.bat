@echo off
echo ========================================
echo   Campus Flow - Sync to GitHub
echo ========================================
cd /d "%~dp0"

echo.
echo 📦 Staging all changes...
"C:\Program Files\Git\bin\git.exe" add .

echo.
echo 📝 Committing changes...
set /p msg="Enter a brief commit message (or press Enter for default): "
if "%msg%"=="" set msg=Update campus-flow project

"C:\Program Files\Git\bin\git.exe" commit -m "%msg%"

echo.
echo 🚀 Pushing to GitHub...
"C:\Program Files\Git\bin\git.exe" push origin main

echo.
echo ========================================
echo   ✅ Done! Check above for results.
echo ========================================
pause
