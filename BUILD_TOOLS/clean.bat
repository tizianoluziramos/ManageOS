@echo off
REM =============================
REM Clean Script
REM =============================

cd ..

echo Eliminando carpeta dist...
if exist dist rmdir /S /Q dist

echo Eliminando carpeta docs...
if exist docs rmdir /S /Q docs

echo.
echo LIMPIEZA COMPLETADA
pause
