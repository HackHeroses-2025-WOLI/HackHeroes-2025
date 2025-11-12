# HackHeroes 2025 - Backend API

Professional FastAPI backend with authentication and user management.

## 🚀 Features

- ✅ JWT-based authentication
- ✅ User registration and login
- ✅ Password hashing with bcrypt
- ✅ Input validation with Pydantic
- ✅ Clean architecture with separation of concerns
- ✅ CORS support
- ✅ API versioning (/api/v1)
- ✅ Comprehensive error handling
- ✅ Environment-based configuration
- ✅ API documentation (Swagger/ReDoc)

## 📁 Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints/
│   │       │   ├── auth.py         # Authentication endpoints
│   │       │   └── users.py        # User management endpoints
│   │       └── router.py           # Main v1 router
│   ├── core/
│   │   ├── security.py             # JWT, password hashing, auth
│   │   └── exceptions.py           # Custom exceptions
│   ├── db/
│   │   ├── database.py             # Database configuration
│   │   └── models.py               # SQLAlchemy models
│   ├── schemas/
│   │   ├── user.py                 # User schemas
│   │   └── token.py                # Token schemas
│   ├── services/
│   │   └── user_service.py         # Business logic
│   ├── config.py                   # App configuration
│   └── main.py                     # FastAPI app
├── tests/                          # Unit tests
├── .env                            # Environment variables (not in git)
├── .env.example                    # Example environment variables
├── .gitignore                      # Git ignore rules
├── requirements.txt                # Python dependencies
└── README.md                       # This file
```

## 🔧 Setup

### 1. Clone and navigate to project
```bash
cd backend
```

### 2. Create virtual environment
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure environment variables
```bash
# Copy example file
copy .env.example .env

# Edit .env and set your SECRET_KEY (IMPORTANT!)
# Generate a secure key with:
# python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 5. Run the application
```bash
# Method 1: Using run.py script (recommended)
python run.py

# Method 2: Using uvicorn directly
uvicorn app.main:app --reload

# Method 3: Production mode
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### 6. Initialize database (first time only)
```bash
python init_db.py
```

## 🚀 Quick Start Commands

```powershell
# Windows PowerShell - Full setup
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
# Edit .env and set SECRET_KEY
python init_db.py
python run.py
```

## 📚 API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc
- **OpenAPI JSON**: http://localhost:8000/api/openapi.json

## 🔑 API Endpoints

### 🏥 Health & Status
- `GET /health` - Check API health status

---

### 👥 **KONTA (Accounts)** - `/api/v1/konta`

#### Rejestracja i Logowanie
- `POST /api/v1/konta/register` - Rejestracja nowego konta
  ```json
  {
    "login_email": "user@example.com",
    "haslo": "SecurePass123",
    "imie_nazwisko": "Jan Kowalski",
    "nr_tel": "123456789",
    "miejscowosc": "Warszawa",
    "typ_dostepnosci": 1,
    "dostepnosc_json": "{\"high_contrast\": true}"
  }
  ```

- `POST /api/v1/konta/login` - Logowanie
  ```json
  {
    "login_email": "user@example.com",
    "haslo": "SecurePass123"
  }
  ```

#### Zarządzanie Kontami
- `GET /api/v1/konta/me` - Pobierz swoje konto (wymaga auth)
- `GET /api/v1/konta/{email}` - Pobierz konto po emailu
- `GET /api/v1/konta/?skip=0&limit=100` - Pobierz wszystkie konta (paginacja)
- `PUT /api/v1/konta/{email}` - Aktualizuj konto
- `DELETE /api/v1/konta/{email}` - Usuń konto

---

### 📋 **ZGŁOSZENIA (Reports)** - `/api/v1/zgloszenia`

#### Tworzenie i Zarządzanie
- `POST /api/v1/zgloszenia/` - Utwórz nowe zgłoszenie
  ```json
  {
    "imie_nazwisko": "Anna Nowak",
    "nr_tel": "987654321",
    "wiek": 45,
    "adres": "ul. Przykładowa 10",
    "miejscowosc": "Kraków",
    "problem": "Brak podjazdu dla wózków inwalidzkich przy wejściu do urzędu",
    "czy_do_kontaktu": true,
    "typ_zgloszenia_id": 1,
    "zgloszenie_szczegoly": "Dodatkowe informacje..."
  }
  ```

#### Przeglądanie Zgłoszeń
- `GET /api/v1/zgloszenia/` - Pobierz wszystkie zgłoszenia
  - Query params: `skip`, `limit`, `typ_zgloszenia_id`, `miejscowosc`
  - Przykład: `/api/v1/zgloszenia/?miejscowosc=Warszawa&limit=50`

- `GET /api/v1/zgloszenia/{id}` - Pobierz zgłoszenie po ID
- `GET /api/v1/zgloszenia/stats` - Statystyki zgłoszeń
- `GET /api/v1/zgloszenia/reporter/{email}` - Zgłoszenia użytkownika

#### Edycja i Usuwanie
- `PUT /api/v1/zgloszenia/{id}` - Aktualizuj zgłoszenie
- `DELETE /api/v1/zgloszenia/{id}` - Usuń zgłoszenie

---

### 🏷️ **TYPY (Types)** - `/api/v1/typy`

#### Typ Dostępności
- `GET /api/v1/typy/dostepnosci` - Pobierz wszystkie typy dostępności
- `GET /api/v1/typy/dostepnosci/{id}` - Pobierz typ po ID
- `POST /api/v1/typy/dostepnosci` - Utwórz nowy typ
  ```json
  {
    "nazwa": "Niewidomy",
    "opis": "Użytkownik niewidomy korzystający z czytnika ekranu"
  }
  ```

#### Typ Zgłoszenia
- `GET /api/v1/typy/zgloszen` - Pobierz wszystkie typy zgłoszeń
- `GET /api/v1/typy/zgloszen/{id}` - Pobierz typ po ID
- `POST /api/v1/typy/zgloszen` - Utwórz nowy typ
  ```json
  {
    "nazwa": "Bariery architektoniczne",
    "opis": "Problemy z dostępnością budynków"
  }
  ```

---

### 🔐 **Authentication (Legacy)** - `/api/v1/auth`
- `POST /api/v1/auth/register` - Rejestracja (stary system)
- `POST /api/v1/auth/login` - Logowanie (stary system)

### 👤 **Users (Legacy)** - `/api/v1/users`
- `GET /api/v1/users/me` - Pobierz profil (stary system)
- `GET /api/v1/users/{user_id}` - Pobierz użytkownika po ID

## 🔐 Authentication Flow

1. **Register**: `POST /api/v1/auth/register`
   ```json
   {
     "username": "testuser",
     "password": "SecurePass123"
   }
   ```

2. **Login**: `POST /api/v1/auth/login`
   ```json
   {
     "username": "testuser",
     "password": "SecurePass123"
   }
   ```
   Returns:
   ```json
   {
     "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
     "token_type": "bearer"
   }
   ```

3. **Use Protected Endpoints**:
   Add header: `Authorization: Bearer <access_token>`

## 🧪 Testing

```bash
# Run tests
pytest

# Run with coverage
pytest --cov=app tests/
```

## 📝 Environment Variables

Required variables in `.env`:

```env
SECRET_KEY=your-super-secret-key-min-32-chars
DATABASE_URL=sqlite:///./users.db
CORS_ORIGINS=http://localhost:3000
DEBUG=True
```

## 🔒 Security Notes

- ⚠️ **NEVER** commit `.env` file or SSL certificates to git
- ⚠️ Always use a strong `SECRET_KEY` in production
- ⚠️ Use HTTPS in production
- ⚠️ Review CORS settings for production

## 🚢 Deployment

For production:
1. Set `DEBUG=False` in `.env`
2. Use PostgreSQL instead of SQLite
3. Set up proper HTTPS/SSL
4. Use environment variables on hosting platform
5. Configure proper CORS origins

## 📄 License

HackHeroes 2025 Project
