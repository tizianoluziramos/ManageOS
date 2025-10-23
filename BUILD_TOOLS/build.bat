@echo off
setlocal enabledelayedexpansion

REM -----------------------
REM Functional build from cmd.exe using new syntax
REM -----------------------

REM Configure PATH
set "PATH=C:\MinGW\bin;%PATH%"

REM Save build.bat directory path
set "BUILD_DIR=%~dp0"
cd /d "%BUILD_DIR%\.."

REM Absolute path to commands.json
set "JSON_PATH=%BUILD_DIR%commands.json"

REM Temporary file for commands
set "TEMP_FILE=%TEMP%\build_commands.txt"
if exist "%TEMP_FILE%" del "%TEMP_FILE%"

REM Create PowerShell script on a single line
powershell -NoProfile -Command ^
  "$commands = (Get-Content '%JSON_PATH%' | ConvertFrom-Json).commands; $commands | ForEach-Object { Write-Output ($_.pre + '§' + $_.command + '§' + $_.after) }" ^
  > "%TEMP_FILE%"

REM Build command chain with && ^
set "CMD_CHAIN="

for /f "usebackq tokens=1,2,3 delims=§" %%A in ("%TEMP_FILE%") do (
    if defined CMD_CHAIN (
        set "CMD_CHAIN=!CMD_CHAIN! && ^ echo %%A && %%B && echo %%C"
    ) else (
        set "CMD_CHAIN=echo %%A && %%B && echo %%C"
    )
)

REM Show final command
echo Command to execute:
echo !CMD_CHAIN!
echo.

REM Execute everything
cmd /v:on /c "!CMD_CHAIN!"

REM Check exit code
if errorlevel 1 (
    echo.
    echo BUILD FAILED (exit code %ERRORLEVEL%)
    exit /b %ERRORLEVEL%
)

echo.
echo BUILD SUCCESSFUL
pause
