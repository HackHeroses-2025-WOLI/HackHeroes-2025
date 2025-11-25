# Backend
### 1. Download project files

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




# Frontend
### 1. Navigate to the project directory
```bash
cd frontend/GenLink
```

### 2. Install dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Configure environment
Edit `constants/config.ts` to point to your backend:
```typescript
export const BASE_URL = 'https://your-backend-url.com/appviews';
```

### 4. Start development server
```bash
# Start Expo development server
npm start

# Platform-specific commands
npm run android    # Start on Android
npm run ios        # Start on iOS  
npm run web        # Start on web browser
```

### 5. Build for production
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure and build
eas build --platform all
```


# Hardware

Build and upload:

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

Example (platformio.ini override)

```ini
[env:esp32dev]
build_flags = -D WIFI_SSID=\"MySSID\" -D WIFI_PASSWORD=\"MySecret\"
```