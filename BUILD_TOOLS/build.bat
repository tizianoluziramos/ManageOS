@echo off
setlocal enabledelayedexpansion

REM -----------------------
REM Build funcional desde cmd.exe con nueva sintaxis
REM -----------------------

REM Configurar PATH
set "PATH=C:\MinGW\bin;%PATH%"

REM Guardar ruta del build.bat
set "BUILD_DIR=%~dp0"
cd /d "%BUILD_DIR%\.."

REM Ruta absoluta al commands.json
set "JSON_PATH=%BUILD_DIR%commands.json"

REM Archivo temporal para comandos
set "TEMP_FILE=%TEMP%\build_commands.txt"
if exist "%TEMP_FILE%" del "%TEMP_FILE%"

REM Crear script PowerShell en una sola línea
powershell -NoProfile -Command ^
  "$commands = (Get-Content '%JSON_PATH%' | ConvertFrom-Json).commands; $commands | ForEach-Object { Write-Output ($_.pre + '§' + $_.command + '§' + $_.after) }" ^
  > "%TEMP_FILE%"

REM Construir cadena de comandos con && ^
set "CMD_CHAIN="

for /f "usebackq tokens=1,2,3 delims=§" %%A in ("%TEMP_FILE%") do (
    if defined CMD_CHAIN (
        set "CMD_CHAIN=!CMD_CHAIN! && ^ echo %%A && %%B && echo %%C"
    ) else (
        set "CMD_CHAIN=echo %%A && %%B && echo %%C"
    )
)

REM Mostrar comando final
echo Comando a ejecutar:
echo !CMD_CHAIN!
echo.

REM Ejecutar todo
cmd /v:on /c "!CMD_CHAIN!"

REM Revisar código de salida
if errorlevel 1 (
    echo.
    echo BUILD FAILED (exit code %ERRORLEVEL%)
    exit /b %ERRORLEVEL%
)

echo.
echo BUILD OK
pause
