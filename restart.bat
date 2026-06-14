@echo off
echo ============================================================
echo  POEM ILLUMINATOR - Dev Server
echo ============================================================
echo  Frontend : http://localhost:3000
echo  Local AI : uvicorn src.createimage:app --port 8083
echo             (optional - enables local Stable Diffusion)
echo.
echo  .env keys (optional):
echo    VITE_HF_TOKEN       - Image generation via HuggingFace FLUX
echo ============================================================
echo.
echo Stopping any process on port 3000...
for /f "tokens=5" %%p in ('netstat -aon ^| findstr ":3000 " ^| findstr "LISTENING"') do (
    taskkill /PID %%p /F >nul 2>&1
)

echo Clearing Vite cache...
if exist "node_modules\.vite" rmdir /s /q "node_modules\.vite"

echo Starting local AI server (port 8083)...
start "Local AI - Stable Diffusion" cmd /k "uvicorn src.createimage:app --port 8083"

echo Starting dev server...
npm run dev
