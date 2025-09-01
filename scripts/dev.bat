@echo off
echo Starting OctoBar development environment for Windows...
set NODE_ENV=development
start /B npm run dev:renderer
timeout /t 3 /nobreak >nul
npm run dev:main
