@echo off
set "SCRIPT_DIR=%~dp0"
set "ROOT_DIR=%SCRIPT_DIR%.."
cd /d "%ROOT_DIR%"
set "ROOT_DIR=%CD%"
echo Extension folder (use this in "Load unpacked"): 
echo %ROOT_DIR%
echo.
start chrome "chrome://extensions"
pause
