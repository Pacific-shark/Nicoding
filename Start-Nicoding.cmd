@echo off
setlocal
set "NICODING_APP_ROOT=%~dp0"
set "NICODING_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not exist "%NICODING_NODE%" set "NICODING_NODE=E:\AI\Tools\nodejs\node.exe"
if not exist "%NICODING_NODE%" for %%N in (node.exe) do set "NICODING_NODE=%%~$PATH:N"
if not exist "%NICODING_NODE%" (
  echo Node.js was not found. Install Node.js 22 or newer.
  pause
  exit /b 1
)
powershell.exe -NoProfile -Command "Start-Process -FilePath $env:NICODING_NODE -ArgumentList (([char]34)+(Join-Path $env:NICODING_APP_ROOT 'server.mjs')+([char]34)) -WorkingDirectory $env:NICODING_APP_ROOT -WindowStyle Hidden"
if errorlevel 1 (
  pause
  exit /b 1
)
if /I "%~1"=="--no-browser" exit /b 0
timeout /t 1 /nobreak >nul
start "" http://127.0.0.1:4173
