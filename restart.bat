@echo off
echo Stopping any process on port 3000...
for /f "tokens=5" %%p in ('netstat -aon ^| findstr ":3000 " ^| findstr "LISTENING"') do (
    taskkill /PID %%p /F >nul 2>&1
)

echo Clearing Vite cache...
if exist "node_modules\.vite" rmdir /s /q "node_modules\.vite"

echo Starting dev server...
npm run dev
