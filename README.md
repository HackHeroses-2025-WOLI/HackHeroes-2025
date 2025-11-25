# Backend

> [!TIP]
> You can use our hosting: https://hackheroes-2025-backend.onrender.com/ (this is default backend link for the entire project)

> [!WARNING]  
> For everything to work properly, you need to visit the website so that render.com can run the code on the server (this is due to the limitations of free hosting)

### 1. Download project files
https://github.com/HackHeroses-2025-WOLI/HackHeroes-2025/releases/tag/1.0.0
extract to desired location and go to `/backend` folder (see `/backend/README.md` for backend-specific instructions)

### 2. Create virtual environment
python -m venv venv

### Windows (PowerShell)
venv\Scripts\activate

### Windows (CMD)
venv\Scripts\activate.bat

### Linux/Mac
source venv/bin/activate

### 3. Install dependencies
pip install -r requirements.txt

```
### 5. Run the application
```bash
python run.py
```

### 6. Initialize database (first time only)
```bash
python init_db.py
```


## Frontend

> [!TIP]
> You can use our hosting: https://hackheroes-2025-frontend.onrender.com/ with our backend (mentioned above) (this is default backend link for the entire project)

> [!WARNING]  
> For everything to work properly, you need to visit the backend website so that render.com can run the code on the server (this is due to the limitations of free hosting)

### Download project files
https://github.com/HackHeroses-2025-WOLI/HackHeroes-2025/releases/tag/1.0.0
extract to desired location and go to the `/frontend` folder (see `/frontend/README.md` or per-subproject READMEs inside `/frontend/GenLink Web App` and `/frontend/GenLink`).

The frontend contains two separate projects:
- `frontend/GenLink Web App` — the web application
- `frontend/GenLink` — the mobile application (Expo)

---

### GenLink Web App (web)
1. Change into the web app folder:

```bash
# change into the web app folder (use quotes to handle spaces on Windows PowerShell and bash)
cd "frontend/GenLink Web App"
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Configure environment

Edit `constants/config.ts` to point to your backend, for example:

```typescript
export const BASE_URL = 'https://your-backend-url.com/appviews';
```

4. Start the development server (typical for React/Vite/CRA apps):

```bash
# start dev server
npm start

# or if your package.json uses a dev script
npm run dev
```

5. Build for production:

```bash
# build static assets
npm run build
```

---

### GenLink (mobile app — Expo)
1. Change into the mobile app folder:

```bash
cd frontend/GenLink
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Configure environment

Edit `constants/config.ts` if present to point to your backend (same example as above).

4. Start the development server (Expo):

```bash
# start expo metro server
npm start
# or explicitly
npx expo start
```

5. Run on specific platforms (from the Expo UI or via npm scripts):

```bash
npm run android    # open on Android device/emulator
npm run ios        # open on iOS simulator (macOS only)
npm run web        # open in a web browser (Expo web)
```

6. Build for production with EAS (Expo Application Services):

```bash
# install EAS CLI globally (if needed)
npm install -g eas-cli

# configure and build
eas build --platform all
```


# Hardware

> [!TIP]
> You can use our backend hosting: https://hackheroes-2025-backend.onrender.com/ (this is default backend link for the entire project)

> [!WARNING]  
> For everything to work properly, you need to visit the backend website so that render.com can run the code on the server (this is due to the limitations of free hosting)

### 1. Download project files
https://github.com/HackHeroses-2025-WOLI/HackHeroes-2025/releases/tag/1.0.0
extract to desired location and go to `/hardware` folder (see `/hardware/README.md` for hardware-specific details)

Additional hardware resources in this repository:

- `/hardware/models` — device/ML models and related files
- `/hardware/zdjecia` — zdjęcia / sample images used by the hardware project


2. Build and upload:

```powershell
# build
pio run

# upload (connect board to USB first)
pio run -t upload

# serial monitor (115200 baud)
pio device monitor --baud 115200
```

Configuration
-------------
All compile-time application settings live in `include/ProjectConfig.h`.
Do NOT commit production secrets directly into source; for production prefer overriding values using `platformio.ini` build_flags.

Key values:
- WIFI_SSID / WIFI_PASSWORD — WiFi credentials
- API_BASE_URL — backend URL for submitting reports
- DEBUG — set to 0 to disable Serial logging
(more in `README.md` in `hardware` folder)

Example (platformio.ini override)

```ini
[env:esp32dev]
build_flags = -D WIFI_SSID=\"MySSID\" -D WIFI_PASSWORD=\"MySecret\"
```
