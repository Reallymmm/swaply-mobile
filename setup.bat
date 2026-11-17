@echo off
echo ============================================
echo  Swaply: first-time setup (takes a few minutes)
echo ============================================
echo.
echo [1/3] Installing packages...
call npm install
if errorlevel 1 goto fail

echo.
echo [2/3] Installing navigation libraries...
call npx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context
if errorlevel 1 goto fail

echo.
echo [3/3] Aligning versions...
call npx expo install --fix

echo.
echo ============================================
echo  DONE.
echo  Now open src\config.js, put your backend address there,
echo  then run start.bat
echo ============================================
pause
exit /b 0

:fail
echo.
echo Something went wrong. Copy the error text above and send it to the chat.
pause
exit /b 1
