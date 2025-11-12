"""Basic tests for the API."""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db.database import Base, get_db

# Test database
TEST_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override database dependency for testing."""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_database():
    """Create and drop test database for each test."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def test_health_check():
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "OK"


def test_register_user():
    """Test user registration."""
    response = client.post(
        "/api/v1/auth/register",
        json={"username": "testuser", "password": "TestPass123"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "testuser"
    assert "id" in data


def test_register_duplicate_user():
    """Test registering duplicate username."""
    client.post(
        "/api/v1/auth/register",
        json={"username": "testuser", "password": "TestPass123"}
    )
    response = client.post(
        "/api/v1/auth/register",
        json={"username": "testuser", "password": "TestPass123"}
    )
    assert response.status_code == 400


def test_login():
    """Test user login."""
    # Register user
    client.post(
        "/api/v1/auth/register",
        json={"username": "testuser", "password": "TestPass123"}
    )
    
    # Login
    response = client.post(
        "/api/v1/auth/login",
        json={"username": "testuser", "password": "TestPass123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_invalid_credentials():
    """Test login with invalid credentials."""
    response = client.post(
        "/api/v1/auth/login",
        json={"username": "nonexistent", "password": "WrongPass123"}
    )
    assert response.status_code == 401


def test_get_current_user():
    """Test getting current user profile."""
    # Register and login
    client.post(
        "/api/v1/auth/register",
        json={"username": "testuser", "password": "TestPass123"}
    )
    login_response = client.post(
        "/api/v1/auth/login",
        json={"username": "testuser", "password": "TestPass123"}
    )
    token = login_response.json()["access_token"]
    
    # Get current user
    response = client.get(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"


def test_get_current_user_unauthorized():
    """Test accessing protected endpoint without token."""
    response = client.get("/api/v1/users/me")
    assert response.status_code == 401
