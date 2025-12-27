@echo off
REM =============================
REM Clean Script
REM =============================

echo Deleting dist folder...
if exist dist rmdir /S /Q dist

echo Deleting docs folder...
if exist docs rmdir /S /Q docs

echo.
echo CLEANUP COMPLETED
