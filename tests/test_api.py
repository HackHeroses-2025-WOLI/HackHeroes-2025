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
                models.TypDostepnosci(id=1, nazwa="Standard", opis="Default accessibility type"),
                models.TypZgloszenia(id=1, nazwa="Infrastruktura", opis="Problemy infrastrukturalne"),
                models.TypZgloszenia(id=2, nazwa="Komunikacja", opis="Problemy komunikacyjne"),
            ]
        )
        db.commit()
    yield
    Base.metadata.drop_all(bind=engine)


def _konto_payload(**overrides):
    payload = {
        "login_email": "jan.kowalski@example.com",
        "haslo": "SecurePass123",
        "imie_nazwisko": "Jan Kowalski",
        "nr_tel": "123456789",
        "miejscowosc": "Warszawa",
        "typ_dostepnosci": 1,
        "dostepnosc_json": "{\"status\": \"available\"}"
    }
    payload.update(overrides)
    return payload


def _register_konto(**overrides):
    return client.post("/api/v1/konta/register", json=_konto_payload(**overrides))


def _login_konto(email="jan.kowalski@example.com", password="SecurePass123"):
    return client.post(
        "/api/v1/konta/login",
        json={"login_email": email, "haslo": password}
    )


def _fetch_konto_from_db(email):
    with TestingSessionLocal() as db:
        return db.query(models.Konto).filter(models.Konto.login_email == email.lower()).first()


def _zgloszenie_payload(**overrides):
    payload = {
        "imie_nazwisko": "Anna Nowak",
        "nr_tel": "987654321",
        "wiek": 30,
        "adres": "ul. Testowa 5",
        "miejscowosc": "Warszawa",
        "problem": "Brak podjazdu dla wózków inwalidzkich przy wejściu",
        "czy_do_kontaktu": True,
        "typ_zgloszenia_id": 1,
        "zgloszenie_szczegoly": "Dodatkowe szczegóły"
    }
    payload.update(overrides)
    return payload


def _create_zgloszenie(**overrides):
    return client.post("/api/v1/zgloszenia/", json=_zgloszenie_payload(**overrides))


def _backdate_zgloszenie(zgloszenie_id: int, days: int) -> None:
    with TestingSessionLocal() as db:
        entry = db.get(models.Zgloszenie, zgloszenie_id)
        entry.data_zgloszenia = datetime.now(timezone.utc) - timedelta(days=days)
        db.commit()


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "OK"


def test_register_konto_success():
    response = _register_konto()
    assert response.status_code == 201
    data = response.json()
    assert data["login_email"] == "jan.kowalski@example.com"
    assert "hash_hasla" not in data

    konto = _fetch_konto_from_db("jan.kowalski@example.com")
    assert konto is not None
    assert konto.hash_hasla != "SecurePass123"
    assert konto.hash_hasla.startswith("$2")


def test_register_konto_duplicate_email_case_insensitive():
    first_response = _register_konto()
    assert first_response.status_code == 201

    duplicate_response = _register_konto(login_email="JAN.KOWALSKI@EXAMPLE.COM")
    assert duplicate_response.status_code == 400
    assert "already exists" in duplicate_response.json()["detail"]


def test_register_konto_invalid_email_rejected():
    response = _register_konto(login_email="invalid-email")
    assert response.status_code == 422
    assert response.json()["detail"][0]["loc"][-1] == "login_email"


def test_register_konto_requires_strong_password():
    response = _register_konto(haslo="password")
    assert response.status_code == 422
    assert "Hasło" in response.json()["detail"][0]["msg"]


def test_register_konto_rejects_bad_json_payload():
    response = _register_konto(dostepnosc_json="{bad json}")
    assert response.status_code == 422
    assert "dostepnosc_json" in response.json()["detail"][0]["loc"]


def test_register_konto_rejects_invalid_phone_number():
    response = _register_konto(nr_tel="12345abc")
    assert response.status_code == 422
    assert "Numer telefonu" in response.json()["detail"][0]["msg"]


def test_register_konto_handles_long_passwords():
    long_password = "A1" * 40  # 80 characters (>72 bytes) exercises hashing fallback
    response = _register_konto(haslo=long_password)
    assert response.status_code == 201

    konto = _fetch_konto_from_db("jan.kowalski@example.com")
    assert konto is not None
    assert konto.hash_hasla.startswith("$2")


def test_login_konto_success():
    _register_konto()
    response = _login_konto()
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_konto_invalid_password():
    _register_konto()
    response = _login_konto(password="WrongPass123")
    assert response.status_code == 401
    assert "Invalid" in response.json()["detail"]


def test_login_konto_unknown_email():
    response = _login_konto(email="no.user@example.com")
    assert response.status_code == 401


def test_get_my_konto_requires_token():
    response = client.get("/api/v1/konta/me")
    assert response.status_code == 401


def test_get_my_konto_rejects_invalid_token():
    response = client.get(
        "/api/v1/konta/me",
        headers={"Authorization": "Bearer invalid.token.value"}
    )
    assert response.status_code == 401


def test_get_my_konto_returns_current_account():
    _register_konto()
    login_response = _login_konto()
    token = login_response.json()["access_token"]

    response = client.get(
        "/api/v1/konta/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["login_email"] == "jan.kowalski@example.com"
    assert "hash_hasla" not in data


def test_get_konto_by_email_public_endpoint():
    _register_konto()
    response = client.get("/api/v1/konta/jan.kowalski@example.com")
    assert response.status_code == 200
    assert response.json()["login_email"] == "jan.kowalski@example.com"
    assert "hash_hasla" not in response.json()


def test_get_konto_by_email_returns_404_for_missing():
    response = client.get("/api/v1/konta/missing@example.com")
    assert response.status_code == 404


def test_get_all_konta_masks_sensitive_fields():
    _register_konto()
    response = client.get("/api/v1/konta/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert "hash_hasla" not in data[0]


def test_create_zgloszenie_success():
    response = _create_zgloszenie()
    assert response.status_code == 201
    data = response.json()
    assert data["miejscowosc"] == "Warszawa"
    assert data["typ_zgloszenia_id"] == 1


def test_get_all_zgloszenia_supports_filters():
    first = _create_zgloszenie()
    assert first.status_code == 201

    second = _create_zgloszenie(
        imie_nazwisko="Ewa Kowal",
        nr_tel="123456789",
        miejscowosc="Gdańsk",
        typ_zgloszenia_id=2,
        problem="Niedziałająca winda na dworcu",
        adres="ul. Dworcowa 1",
    )
    assert second.status_code == 201

    third = _create_zgloszenie(
        imie_nazwisko="Piotr Zieliński",
        nr_tel="111222333",
        miejscowosc="Poznań",
        problem="Zablokowane wejście do urzędu",
        adres="ul. Stara 2",
    )
    assert third.status_code == 201
    _backdate_zgloszenie(third.json()["id"], days=10)

    # miejscowosc filter (case-insensitive substring)
    response = client.get("/api/v1/zgloszenia/?miejscowosc=da")
    assert response.status_code == 200
    assert len(response.json()) == 1

    # search filter
    response = client.get("/api/v1/zgloszenia/?search=winda")
    assert response.status_code == 200
    items = response.json()
    assert len(items) == 1
    assert items[0]["typ_zgloszenia_id"] == 2

    # date range filter
    today = datetime.now(timezone.utc).date()
    response = client.get(f"/api/v1/zgloszenia/?data_od={(today - timedelta(days=1)).isoformat()}")
    assert response.status_code == 200
    assert len(response.json()) == 2

    response = client.get(f"/api/v1/zgloszenia/?data_do={(today - timedelta(days=5)).isoformat()}")
    assert response.status_code == 200
    assert len(response.json()) == 1

    # type filter
    response = client.get("/api/v1/zgloszenia/?typ_zgloszenia_id=2")
    assert response.status_code == 200
    assert len(response.json()) == 1


def test_get_zgloszenia_stats():
    _create_zgloszenie()
    _create_zgloszenie(
        imie_nazwisko="Ewa Kowal",
        nr_tel="123456789",
        miejscowosc="Gdańsk",
        typ_zgloszenia_id=2,
        problem="Niedziałająca winda na dworcu",
        adres="ul. Dworcowa 1",
    )

    response = client.get("/api/v1/zgloszenia/stats")
    assert response.status_code == 200
    data = response.json()
    assert data["total_zgloszenia"] == 2
    assert data["by_type"]["1"] == 1
    assert data["by_type"]["2"] == 1
