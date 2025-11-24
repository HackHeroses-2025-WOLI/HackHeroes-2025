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

### Optional: Manual schema helpers
When upgrading an existing SQLite database, run the lightweight helpers to ensure all required columns exist:

```bash
python scripts/add_is_active_column.py users.db
python scripts/add_is_reviewed_column.py users.db
python scripts/add_genpoints_column.py users.db
python scripts/add_accepted_at_column.py users.db
python scripts/add_completed_columns.py users.db
```

Each script creates a timestamped backup before altering the table.

## 🐳 Docker

1. Copy `.env.example` to `.env` and set a secure `SECRET_KEY` (plus any other overrides).
2. Build and run the stack:

```bash
docker compose up --build
```

Docker Compose automatically injects the values from `.env` (they are *not* baked into the image) and mounts a named volume at `/app/data` so the SQLite database survives container restarts.

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

### 👥 **ACCOUNTS** - `/api/v1/accounts`

#### Registration & Login
- `POST /api/v1/accounts/register` - Register a new account
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePass123",
    "full_name": "Jan Kowalski",
    "phone": "123456789",
    "city": "Warsaw",
    "availability": [
      {
        "day_of_week": 1,
        "start_time": "08:00",
        "end_time": "16:00",
        "is_active": true
      }
    ]
  }
  ```

- `POST /api/v1/accounts/login` - Login
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePass123"
  }
  ```

#### Account Management
- `GET /api/v1/accounts/me` - Get your account (requires auth)
- `GET /api/v1/accounts/{email}` - REMOVED
- `GET /api/v1/accounts/volunteers/active` - Public list of active volunteers
- `PUT /api/v1/accounts/me` - Update your account (requires auth)
- `DELETE /api/v1/accounts/me` - Delete your account (requires auth)
Account responses returned by authenticated endpoints now expose a `genpoints` counter so volunteers can track earned credit (+10 per completed report).

---

### 📋 **REPORTS** - `/api/v1/reports`

> **All report endpoints require** `Authorization: Bearer <token>` obtained from
> `/api/v1/accounts/login`.
> Note: Reports are submitted publicly (no token required) and `reporter_email` will be empty for anonymous reports.

#### Create and Manage
- `POST /api/v1/reports/` - Create a new report
  ```json
  {
    "full_name": "Anna Nowak",
    "phone": "987654321",
    "age": 45,
    "address": "ul. Przykładowa 10",
    "city": "Krakow",
    "problem": "No wheelchair ramp at the government office entrance",
    "contact_ok": true,
    "report_type_id": 1,
    "report_details": "Dodatkowe informacje..."
  }
  ```
  Response bodies now include a boolean `is_reviewed` flag so operators immediately know whether the report has already been triaged. Newly created reports default to `false`.

#### Browse Reports
- `GET /api/v1/reports/` - Get all available reports (excludes accepted and completed reports)
  - Query params: `skip`, `limit`, `report_type_id`, `city`, `search`, `date_from`, `date_to`
  - Example: `/api/v1/reports/?city=Warsaw&limit=50`
  - Note: This endpoint shows only reports that are neither currently assigned nor already completed

- `GET /api/v1/reports/{id}` - Get a report by ID
- `GET /api/v1/reports/stats` - Reports statistics
- `GET /api/v1/reports/metrics/avg-response-time` - Public average response time (minutes) between report submission and first acceptance
- `GET /api/v1/reports/my-accepted-report` - Authenticated helper returning the ID of the report currently assigned to you (or `null` if none)
- `GET /api/v1/reports/my-completed-reports` - Get full report data for all reports completed by you (requires auth, supports `skip`/`limit` pagination)
- `GET /api/v1/reports/reporter/{email}` - REMOVED

#### Edit & Delete
- `POST /api/v1/reports/{id}/accept` – Accept a report (requires auth). Only one volunteer can own a report at a time; the endpoint returns HTTP `409` if somebody else already works on it, or `400` if you already have another active report.
- `POST /api/v1/reports/active/cancel` – Release your currently assigned report so another volunteer may take it.
- `POST /api/v1/reports/active/complete` – Mark the active report as completed. This clears `active_report`, increments the `resolved_cases` counters, and awards **+10 genpoints** (displayed on `/api/v1/accounts/me`).

---

### 🏷️ **TYPES** - `/api/v1/types`

- `GET /api/v1/types/report_types` - Get all predefined report categories

---

### 🔐 **Authentication (Legacy)** - `/api/v1/auth`
- `POST /api/v1/auth/register` - Registration (legacy system)
- `POST /api/v1/auth/login` - Login (legacy system)

### 👤 **Users (Legacy)** - `/api/v1/users`
- `GET /api/v1/users/me` - Get profile (legacy system)
- `GET /api/v1/users/{user_id}` - Get user by ID

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
