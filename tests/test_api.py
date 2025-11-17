"""Comprehensive API tests for public API endpoints."""
from datetime import datetime, timedelta, timezone

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db.database import Base, get_db
from app.db import models


TEST_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override database dependency with isolated test session."""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_database():
    """Reset schema and seed mandatory reference data for every test."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    with TestingSessionLocal() as db:
        db.add_all(
            [
                models.AvailabilityType(id=1, name="Standard", description="Default accessibility type"),
                models.ReportType(id=1, name="Infrastructure", description="Infrastructure issues"),
                models.ReportType(id=2, name="Transport", description="Transport issues"),
            ]
        )
        db.commit()
    yield
    Base.metadata.drop_all(bind=engine)


def _account_payload(**overrides):
    payload = {
        "email": "jan.kowalski@example.com",
        "password": "SecurePass123",
        "full_name": "Jan Kowalski",
        "phone": "123456789",
        "city": "Warsaw",
        "availability_type": 1,
        "availability_json": "{\"status\": \"available\"}"
    }
    payload.update(overrides)
    return payload


def _register_account(**overrides):
    return client.post("/api/v1/accounts/register", json=_account_payload(**overrides))


def _login_account(email="jan.kowalski@example.com", password="SecurePass123"):
    return client.post(
        "/api/v1/accounts/login",
        json={"email": email, "password": password}
    )


def _fetch_account_from_db(email):
    with TestingSessionLocal() as db:
        return db.query(models.Account).filter(models.Account.email == email.lower()).first()


def _report_payload(**overrides):
    payload = {
        "full_name": "Anna Nowak",
        "phone": "987654321",
        "age": 30,
        "address": "ul. Testowa 5",
            "city": "Warsaw",
        "problem": "Brak podjazdu dla wózków inwalidzkich przy wejściu",
        "contact_ok": True,
        "report_type_id": 1,
        "report_details": "Additional details"
    }
    payload.update(overrides)
    return payload


def _create_report(**overrides):
    return client.post("/api/v1/reports/", json=_report_payload(**overrides))


def _backdate_report(report_id: int, days: int) -> None:
    with TestingSessionLocal() as db:
        entry = db.get(models.Report, report_id)
        entry.reported_at = datetime.now(timezone.utc) - timedelta(days=days)
        db.commit()


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "OK"


def test_register_account_success():
    response = _register_account()
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "jan.kowalski@example.com"
    assert "password_hash" not in data

    account = _fetch_account_from_db("jan.kowalski@example.com")
    assert account is not None
    assert account.password_hash != "SecurePass123"
    assert account.password_hash.startswith("$2")


def test_register_account_duplicate_email_case_insensitive():
    first_response = _register_account()
    assert first_response.status_code == 201

    duplicate_response = _register_account(email="JAN.KOWALSKI@EXAMPLE.COM")
    assert duplicate_response.status_code == 400
    assert "already exists" in duplicate_response.json()["detail"]


def test_register_account_invalid_email_rejected():
    response = _register_account(email="invalid-email")
    assert response.status_code == 422
    assert response.json()["detail"][0]["loc"][-1] == "email"


def test_register_account_requires_strong_password():
    response = _register_account(password="password")
    assert response.status_code == 422
    assert "Password" in response.json()["detail"][0]["msg"]


def test_register_account_rejects_bad_json_payload():
    response = _register_account(availability_json="{bad json}")
    assert response.status_code == 422
    assert "availability_json" in response.json()["detail"][0]["loc"]


def test_register_account_rejects_invalid_phone_number():
    response = _register_account(phone="12345abc")
    assert response.status_code == 422
    assert "Phone number" in response.json()["detail"][0]["msg"]


def test_register_account_handles_long_passwords():
    long_password = "A1" * 40  # 80 characters (>72 bytes) exercises hashing fallback
    response = _register_account(password=long_password)
    assert response.status_code == 201

    account = _fetch_account_from_db("jan.kowalski@example.com")
    assert account is not None
    assert account.password_hash.startswith("$2")


def test_login_account_success():
    _register_account()
    response = _login_account()
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_account_invalid_password():
    _register_account()
    response = _login_account(password="WrongPass123")
    assert response.status_code == 401
    assert "Invalid" in response.json()["detail"]


def test_login_account_unknown_email():
    response = _login_account(email="no.user@example.com")
    assert response.status_code == 401


def test_get_my_account_requires_token():
    response = client.get("/api/v1/accounts/me")
    assert response.status_code == 401


def test_get_my_account_rejects_invalid_token():
    response = client.get(
        "/api/v1/accounts/me",
        headers={"Authorization": "Bearer invalid.token.value"}
    )
    assert response.status_code == 401


def test_get_my_account_returns_current_account():
    _register_account()
    login_response = _login_account()
    token = login_response.json()["access_token"]

    response = client.get(
        "/api/v1/accounts/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "jan.kowalski@example.com"
    assert "password_hash" not in data


def test_get_account_by_email_public_endpoint():
    _register_account()
    response = client.get("/api/v1/accounts/jan.kowalski@example.com")
    assert response.status_code == 200
    assert response.json()["email"] == "jan.kowalski@example.com"
    assert "password_hash" not in response.json()


def test_get_account_by_email_returns_404_for_missing():
    response = client.get("/api/v1/accounts/missing@example.com")
    assert response.status_code == 404


def test_get_all_accounts_masks_sensitive_fields():
    _register_account()
    response = client.get("/api/v1/accounts/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert "password_hash" not in data[0]


def test_create_report_success():
    response = _create_report()
    assert response.status_code == 201
    data = response.json()
    assert data["city"] == "Warsaw"
    assert data["report_type_id"] == 1


def test_get_all_reports_supports_filters():
    first = _create_report()
    assert first.status_code == 201

    second = _create_report(
        full_name="Ewa Kowal",
        phone="123456789",
        city="Gdansk",
        report_type_id=2,
        problem="Niedziałająca winda na dworcu",
        address="ul. Dworcowa 1",
    )
    assert second.status_code == 201

    third = _create_report(
        full_name="Piotr Zieliński",
        phone="111222333",
        city="Poznan",
        problem="Zablokowane wejście do urzędu",
        address="ul. Stara 2",
    )
    assert third.status_code == 201
    _backdate_report(third.json()["id"], days=10)

    # city filter (case-insensitive substring)
    response = client.get("/api/v1/reports/?city=da")
    assert response.status_code == 200
    assert len(response.json()) == 1

    # search filter
    response = client.get("/api/v1/reports/?search=winda")
    assert response.status_code == 200
    items = response.json()
    assert len(items) == 1
    assert items[0]["report_type_id"] == 2

    # date range filter
    today = datetime.now(timezone.utc).date()
    response = client.get(f"/api/v1/reports/?date_from={(today - timedelta(days=1)).isoformat()}")
    assert response.status_code == 200
    assert len(response.json()) == 2

    response = client.get(f"/api/v1/reports/?date_to={(today - timedelta(days=5)).isoformat()}")
    assert response.status_code == 200
    assert len(response.json()) == 1

    # type filter
    response = client.get("/api/v1/reports/?report_type_id=2")
    assert response.status_code == 200
    assert len(response.json()) == 1


def test_get_reports_stats():
    _create_report()
    _create_report(
        full_name="Ewa Kowal",
        phone="123456789",
        city="Gdansk",
        report_type_id=2,
        problem="Niedziałająca winda na dworcu",
        address="ul. Dworcowa 1",
    )

    response = client.get("/api/v1/reports/stats")
    assert response.status_code == 200
    data = response.json()
    assert data["total_reports"] == 2
    assert data["by_type"]["1"] == 1
    assert data["by_type"]["2"] == 1
