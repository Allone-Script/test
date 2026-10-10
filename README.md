# DolaBypass Android APK Builder via GitHub Actions

Этот проект позволяет автоматически собрать готовый файл **`DolaBypass.apk`** в облаке GitHub без необходимости устанавливать тяжелый Android SDK на компьютер!

## 🚀 Как получить готовый APK файл за 2 минуты:

1. **Создайте новый приватный или публичный репозиторий на GitHub:**
   - Назовите его, например, `dolabypass-android`.

2. **Загрузите содержимое этой папки в репозиторий:**
   - Перетащите файлы из этой папки прямо в веб-интерфейс GitHub или выполните через Git:
   ```bash
   git init
   git add .
   git commit -m "Init DolaBypass Android"
   git branch -M main
   git remote add origin https://github.com/ВАШ_НИК/dolabypass-android.git
   git push -u origin main
   ```

3. **Сборка APK в GitHub Actions:**
   - Зайдите во вкладку **Actions** в вашем репозитории на GitHub.
   - Сборка **`Build DolaBypass APK`** запустится автоматически! (или нажмите `Run workflow`).
   - GitHub выделит виртуальную машину с Linux, установит Android SDK и соберет APK за ~60 секунд.

4. **Скачивание APK:**
   - Когда сборка завершится (зеленая галочка), откройте этот запуск во вкладке Actions.
   - Внизу в разделе **Artifacts** нажмите на **`DolaBypass-Debug-APK`**.
   - Скачается архив с готовым файлом **`app-debug.apk`**, который можно сразу устанавливать на любой Android смартфон!

---

## 📱 Что внутри APK:
- Полноэкранный темный WebView с официальным интерфейсом `https://dola.com`.
- Фирменная фиолетовая иконка Möbius (`ic_launcher.png`).
- Нативная автоматическая инъекция `inject.js`, `duration-page-bridge.js` и сплэш-экрана DolaBypass By Fikus прямо в память страницы.
- Поддержка cookies, авторизации и режима 30 секунд.
