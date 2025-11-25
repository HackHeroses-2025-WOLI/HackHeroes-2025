# HackHeroes 2025 - Backend API

Professional FastAPI backend for accessibility reporting system with volunteer management.

```bash
## 🚀 Features

- ✅ JWT-based authentication with secure token management
- ✅ Public report submission (no authentication required)
- ✅ Volunteer account system with registration and profile management
- ✅ Report assignment and completion workflow
- ✅ Gamification with genpoints system
- ✅ Comprehensive logging (session-based + latest.log)
- ✅ Password hashing with bcrypt
- ✅ Input validation with Pydantic
- ✅ Clean architecture with separation of concerns
- ✅ CORS support
- ✅ API versioning (/api/v1)
- ✅ Comprehensive error handling
- ✅ Environment-based configuration
- ✅ API documentation (Swagger/ReDoc)
- ✅ Report statistics and filtering
- ✅ Volunteer availability tracking

## 📁 Project Structure

HackHeroes-2025/
├── app/
│ ├── api/
│ │ └── v1/
│ │ ├── endpoints/
│ │ │ ├── accounts.py # Volunteer account management
│ │ │ ├── auth.py # Authentication (login)
│ │ │ ├── reports.py # Report CRUD and assignment
│ │ │ ├── types.py # Report type management
│ │ │ └── users.py # User endpoints (deprecated)
│ │ └── router.py # Main v1 router
│ ├── core/
│ │ ├── security.py # JWT, password hashing, auth
│ │ ├── logger.py # Session-based logging system
│ │ └── exceptions.py # Custom exceptions
│ ├── db/
│ │ ├── database.py # Database configuration
│ │ └── models.py # SQLAlchemy models (Account, Report, ReportType)
│ ├── schemas/
│ │ ├── account.py # Account schemas
│ │ ├── report.py # Report schemas
│ │ ├── type.py # ReportType schemas
│ │ └── token.py # Token schemas
│ ├── services/
│ │ ├── account_service.py # Account business logic
│ │ └── report_service.py # Report business logic
│ ├── config.py # App configuration
│ └── main.py # FastAPI app entry point
├── logs/ # Session logs (gitignored)
│ ├── latest.log # Current session logs
│ └── DD-MM-YYYYTHH-MM-SS.log # Timestamped session backups
├── scripts/ # Database migration helpers
│ ├── add_is_active_column.py
│ ├── add_is_reviewed_column.py
│ ├── add_genpoints_column.py
│ ├── add_accepted_at_column.py
│ └── add_completed_columns.py
├── tests/
│ └── test_api.py # Comprehensive API tests
├── .env # Environment variables (not in git)
├── .env.example # Example environment variables
├── .env.template # Environment variable template
├── .gitignore # Git ignore rules
├── pytest.ini # Pytest configuration
├── requirements.txt # Python dependencies
├── run.py # Development server script
├── init_db.py # Database initialization
├── API_ENDPOINTS.md # Complete API documentation
└── README.md # This file

## 🔧 Setup

### 1. Clone and navigate to project

git clone "https://github.com/HackHeroses-2025-WOLI/HackHeroes-2025.git"
cd HackHeroes-2025

### 2. Create virtual environment
python -m venv venv

# Windows (PowerShell)
venv\Scripts\activate

# Windows (CMD)
venv\Scripts\activate.bat

# Linux/Mac
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

HackHeroes 2025 Project
