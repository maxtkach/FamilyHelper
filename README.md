# FamilyHelper

Мобильное приложение для управления семейными задачами, бюджетом и событиями.

## Установка и запуск

### Предварительные требования

- Node.js 14+ и npm/yarn
- MongoDB (используется существующая база данных в облаке)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [ngrok](https://ngrok.com/) для доступа к серверу с мобильных устройств

### Установка зависимостей

1. Клонируйте репозиторий:
```bash
git clone https://github.com/your-username/FamilyHelper.git
cd FamilyHelper
```

2. Установите зависимости для frontend:
```bash
npm install
```

3. Установите зависимости для backend:
```bash
cd backend
npm install
cd ..
```

### Запуск приложения

1. Запустите backend-сервер:
```bash
cd backend
npm start
```

2. Настройте доступ через ngrok в новом терминале:
```bash
ngrok http 5000
```

3. Скопируйте полученный URL из ngrok (например, `https://xxxx-xxx-xx-xx-xx.ngrok-free.app`) и замените им значение `NGROK_URL` в файле `src/context/AppContext.tsx`.

4. Запустите frontend приложение:
```bash
npm start
```

5. Отсканируйте QR-код в терминале с помощью приложения Expo Go на мобильном устройстве.

## Важные моменты при использовании

1. **База данных MongoDB**: Приложение настроено на использование существующей MongoDB Atlas базы данных. Учетные данные уже предоставлены в `backend/.env`.

2. **Подключение через ngrok**: Каждый раз, когда вы запускаете ngrok, вы получаете новый URL. Не забудьте обновить его в `src/context/AppContext.tsx`.

3. **Тестовые учетные записи**:
   - Email: test@example.com
   - Пароль: password123

## Функциональность

- Управление задачами
- Планирование семейного бюджета
- Календарь событий
- Категории расходов

## Технологический стек

- Frontend: React Native с Expo
- Backend: Node.js, Express.js
- База данных: MongoDB
- Аутентификация: JWT 