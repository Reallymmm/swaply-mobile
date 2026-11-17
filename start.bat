@echo off
echo Starting Expo with tunnel. Scan the QR code in Expo Go.
echo (If it asks to install @expo/ngrok, type y and press Enter)
echo.
call npx expo start --tunnel
pause
