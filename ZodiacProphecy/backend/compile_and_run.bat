
@echo off
echo Compiling and running Zodiac Prophecy Server...
echo.

cd backend
javac ZodiacServer.java
if %ERRORLEVEL% NEQ 0 (
    echo Compilation failed!
    pause
    exit /b 1
)

echo Compilation successful!
echo Starting server...
echo.
java ZodiacServer
pause
