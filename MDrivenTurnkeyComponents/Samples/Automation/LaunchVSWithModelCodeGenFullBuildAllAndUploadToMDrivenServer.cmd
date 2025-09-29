@echo off
setlocal

:: Configuration
set "MODELAUTOMATION_URL=http://localhost:5019"
set "MODELAUTOMATION_USER=a"
set "MODELAUTOMATION_PWD=123456"
set "LOGFILE=C:\Users\hkarlsen\source\repos\MDriven Solution Template1\MDRIVENAUTOMATIONRESULT.log"
set "MODELFILE=C:\Users\hkarlsen\source\repos\MDriven Solution Template1\MDriven Solution Template1\MDrivenEcoSpaceAndModelNetStandard\MDrivenModel.ecomdl"
set "SLNFILE=C:\Users\hkarlsen\source\repos\MDriven Solution Template1\MDriven Solution Template1.sln"
set "DEVENV=C:\Program Files\Microsoft Visual Studio\2022\Community\Common7\IDE\devenv.exe"

:: Delete old log file if it exists
if exist "%LOGFILE%" (
    echo Deleting old log file...
    del "%LOGFILE%"
)

:: Launch Visual Studio with model automation
echo Launching Visual Studio with model automation...
"%DEVENV%" "%SLNFILE%" MODELAUTOMATION="%MODELFILE%"

:: Wait for Visual Studio to close (optional)
:: timeout /t 30 >nul

:: Display log file contents
echo.
echo ===== Automation Result =====
if exist "%LOGFILE%" (
    type "%LOGFILE%"
) else (
    echo Log file not found: "%LOGFILE%""
)

endlocal
