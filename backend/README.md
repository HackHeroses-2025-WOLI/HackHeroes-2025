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
# Development mode with auto-reload
uvicorn app.main:app --reload

# Or use Python directly
python -m app.main

# Production mode
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## 📚 API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc
- **OpenAPI JSON**: http://localhost:8000/api/openapi.json

## 🔑 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login and get JWT token

### Users (Protected)
- `GET /api/v1/users/me` - Get current user profile
- `GET /api/v1/users/{user_id}` - Get user by ID

### Health Check
- `GET /health` - Check API health status

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
