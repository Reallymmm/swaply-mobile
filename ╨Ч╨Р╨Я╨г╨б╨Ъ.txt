SWAPLY - МОБИЛЬНОЕ ПРИЛОЖЕНИЕ (Expo)

Что нужно заранее:
  - Node.js (уже стоит)
  - Expo Go на телефоне
  - запущенный бэкенд (папка swaply-admin\backend):
        uvicorn app.main:app --reload --host 0.0.0.0

Запуск:
  1. Открой файл src\config.js и впиши адрес бэкенда, например:
        export const API_URL = "http://192.168.0.105:8000";
     (IP компьютера смотри командой ipconfig, строка "IPv4-адрес")

  2. Один раз запусти setup.bat (двойной клик) и дождись надписи DONE.

  3. Запусти start.bat (двойной клик). Появится QR-код.
     Если спросит про установку @expo/ngrok - напиши y и нажми Enter.

  4. Отсканируй QR-код в Expo Go.

  5. Войди: yana@mail.ru / 123456

Если Expo Go пишет "Project is incompatible with this version of Expo Go":
  Версия Expo в этом проекте (57) должна совпадать с твоим Expo Go.
  Открой package.json старого проекта C:\pro\swaply, скопируй оттуда
  блок "dependencies" в package.json этого проекта (вместо моего),
  потом снова запусти setup.bat.
