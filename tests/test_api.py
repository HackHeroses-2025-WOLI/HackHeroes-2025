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
                models.ReportType(id=1, name="Aplikacje", description="Problemy z aplikacjami"),
                models.ReportType(id=2, name="Bezpieczeństwo", description="Zgłoszenia bezpieczeństwa"),
                models.ReportType(id=3, name="Kontakt i połączenia", description="Problemy komunikacyjne"),
                models.ReportType(id=4, name="Płatności i bankowość", description="Trudności finansowe"),
                models.ReportType(id=5, name="Inne", description="Pozostałe sytuacje"),
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


def _auth_headers(email="jan.kowalski@example.com", password="SecurePass123"):
    """Register (if needed) and return auth headers for the account."""

    register_response = _register_account(email=email, password=password)
    if register_response.status_code not in (201, 400):
        raise AssertionError(f"Unexpected register status {register_response.status_code}: {register_response.text}")

    login_response = _login_account(email=email, password=password)
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def _fetch_account_from_db(email):
    # Deprecated: tests should use endpoints rather than direct DB queries.
    raise RuntimeError("Direct DB access from tests is not supported; use API endpoints instead")


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


def _create_report(headers=None, **overrides):
    return client.post(
        "/api/v1/reports/",
        json=_report_payload(**overrides),
        headers=headers or {},
    )


def _backdate_report(report_id: int, days: int) -> None:
    with TestingSessionLocal() as db:
        entry = db.get(models.Report, report_id)
        entry.reported_at = datetime.now(timezone.utc) - timedelta(days=days)
        db.commit()


def _set_reported_at_delta_minutes(report_id: int, minutes: int) -> None:
    with TestingSessionLocal() as db:
        entry = db.get(models.Report, report_id)
        assert entry.accepted_at is not None
        entry.reported_at = entry.accepted_at - timedelta(minutes=minutes)
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

    # ensure we can log in and fetch the account via API (don't inspect DB directly)
    login_response = _login_account()
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]

    response = client.get("/api/v1/accounts/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["email"] == "jan.kowalski@example.com"
    # password hash must not be returned by the API
    assert "password_hash" not in response.json()


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


def test_register_account_rejects_invalid_phone_number():
    response = _register_account(phone="12345abc")
    assert response.status_code == 422
    assert "Phone number" in response.json()["detail"][0]["msg"]


def test_register_account_handles_long_passwords():
    long_password = "A1" * 40  # 80 characters (>72 bytes) exercises hashing fallback
    response = _register_account(password=long_password)
    assert response.status_code == 201

    # Verify we can log in with a long password (exercises hashing fallback)
    login_response = _login_account(password=long_password)
    assert login_response.status_code == 200


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
    # account lookup removed
    response = client.get("/api/v1/accounts/jan.kowalski@example.com")
    assert response.status_code == 404


def test_get_account_by_email_returns_404_for_missing():
    response = client.get("/api/v1/accounts/missing@example.com")
    assert response.status_code == 404


def test_public_active_volunteers_endpoint():
    today = datetime.now().weekday()
    volunteer_email = "wolontariusz@example.com"
    _register_account(email=volunteer_email)

    login = _login_account(email=volunteer_email)
    token = login.json()["access_token"]

    update_response = client.put(
        "/api/v1/accounts/me",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "availability": [
                {
                    "day_of_week": today,
                    "start_time": "00:00",
                    "end_time": "23:59",
                    "is_active": True,
                }
            ]
        },
    )
    assert update_response.status_code == 200

    response = client.get("/api/v1/accounts/volunteers/active")
    assert response.status_code == 200
    payload = response.json()
    volunteers = payload["volunteers"]
    assert payload["total_scheduled_active"] >= 1
    assert any(v["email"] == volunteer_email for v in volunteers)
    first = next(v for v in volunteers if v["email"] == volunteer_email)
    assert first["is_active_now"] is True
    assert first["schedule_active_now"] is True
    assert first["availability"][0]["day_of_week"] == today


def test_manual_active_override_makes_volunteer_visible_without_schedule():
    email = "manual@example.com"
    _register_account(email=email)

    login = _login_account(email=email)
    token = login.json()["access_token"]

    update_response = client.put(
        "/api/v1/accounts/me",
        headers={"Authorization": f"Bearer {token}"},
        json={"is_active": True},
    )
    assert update_response.status_code == 200

    response = client.get("/api/v1/accounts/volunteers/active")
    assert response.status_code == 200
    payload = response.json()
    assert payload["total_manual_active"] >= 1
    volunteers = payload["volunteers"]
    first = next(v for v in volunteers if v["email"] == email)
    assert first["is_active"] is True
    assert first["schedule_active_now"] is False
    assert first["is_active_now"] is True


def test_update_account_returns_manual_flag_state():
    email = "toggle@example.com"
    _register_account(email=email)
    login = _login_account(email=email)
    token = login.json()["access_token"]

    response = client.put(
        "/api/v1/accounts/me",
        headers={"Authorization": f"Bearer {token}"},
        json={"is_active": True},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["is_active"] is True

    me = client.get(
        "/api/v1/accounts/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me.status_code == 200
    assert me.json()["is_active"] is True


def test_create_report_success():
    # report submission is public: no token required
    response = client.post("/api/v1/reports/", json=_report_payload())
    assert response.status_code == 201
    data = response.json()
    assert data["city"] == "Warsaw"
    assert data["report_type_id"] == 1
    assert data["reporter_email"] is None
    assert data["is_reviewed"] is False


def test_reports_endpoints_require_token():
    # listing and stats stay protected
    response = client.get("/api/v1/reports/")
    assert response.status_code == 401

    # creating a report should be allowed without a token
    response = client.post("/api/v1/reports/", json=_report_payload())
    assert response.status_code == 201


def test_reports_listing_without_trailing_slash_returns_ok():
    headers = _auth_headers(email="noslash@example.com")
    _create_report()

    response = client.get("/api/v1/reports?limit=5", headers=headers, follow_redirects=False)
    assert response.status_code == 200
    assert response.history == []  # no redirect
    assert len(response.json()) >= 1


def test_inactive_volunteer_can_view_reports():
    headers = _auth_headers(email="inactive@example.com")
    _create_report()

    deactivate = client.put(
        "/api/v1/accounts/me",
        headers=headers,
        json={"is_active": False},
    )
    assert deactivate.status_code == 200

    response = client.get("/api/v1/reports", headers=headers, follow_redirects=False)
    assert response.status_code == 200
    assert len(response.json()) >= 1


def test_get_all_reports_supports_filters():
    headers = _auth_headers()
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
    third_id = third.json()["id"]
    _backdate_report(third_id, days=10)

    # Accept one report so it's excluded from the listing
    accept_response = client.post(f"/api/v1/reports/{third_id}/accept", headers=headers)
    assert accept_response.status_code == 200

    # Verify accepted report is excluded
    all_reports = client.get("/api/v1/reports/", headers=headers)
    assert all_reports.status_code == 200
    assert len(all_reports.json()) == 2  # Only first and second

    # Complete the accepted report
    complete_response = client.post("/api/v1/reports/active/complete", headers=headers)
    assert complete_response.status_code == 200

    # Verify completed report is still excluded (completed reports shouldn't appear in main list)
    all_reports = client.get("/api/v1/reports/", headers=headers)
    assert all_reports.status_code == 200
    assert len(all_reports.json()) == 2  # Still only first and second

    # city filter (case-insensitive substring) - only unaccepted and uncompleted
    response = client.get("/api/v1/reports/?city=da", headers=headers)
    assert response.status_code == 200
    assert len(response.json()) == 1

    # search filter
    response = client.get("/api/v1/reports/?search=winda", headers=headers)
    assert response.status_code == 200
    items = response.json()
    assert len(items) == 1
    assert items[0]["report_type_id"] == 2

    # date range filter - third is completed so excluded
    today = datetime.now(timezone.utc).date()
    response = client.get(
        f"/api/v1/reports/?date_from={(today - timedelta(days=1)).isoformat()}",
        headers=headers,
    )
    assert response.status_code == 200
    assert len(response.json()) == 2

    response = client.get(
        f"/api/v1/reports/?date_to={(today - timedelta(days=5)).isoformat()}",
        headers=headers,
    )
    assert response.status_code == 200
    assert len(response.json()) == 0  # third is completed

    # type filter
    response = client.get("/api/v1/reports/?report_type_id=2", headers=headers)
    assert response.status_code == 200
    assert len(response.json()) == 1


def test_get_reports_stats_counts_only_pending_reports():
    headers = _auth_headers()
    first = _create_report(headers=headers)
    first_id = first.json()["id"]
    second = _create_report(
        headers,
        full_name="Ewa Kowal",
        phone="123456789",
        city="Gdansk",
        report_type_id=2,
        problem="Niedziałająca winda na dworcu",
        address="ul. Dworcowa 1",
    )
    assert second.status_code == 201

    accept_first = client.post(f"/api/v1/reports/{first_id}/accept", headers=headers)
    assert accept_first.status_code == 200
    complete_first = client.post("/api/v1/reports/active/complete", headers=headers)
    assert complete_first.status_code == 200

    response = client.get("/api/v1/reports/stats", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total_reports"] == 1
    # Only report type 2 (pending) should be counted
    assert data["by_type"]["2"] == 1
    assert "1" not in data["by_type"]


def test_volunteer_accepts_and_blocks_others_until_release():
    primary_headers = _auth_headers(email="volunteer1@example.com")
    secondary_headers = _auth_headers(email="volunteer2@example.com")

    create_resp = client.post("/api/v1/reports/", json=_report_payload())
    assert create_resp.status_code == 201
    report_id = create_resp.json()["id"]

    accept = client.post(f"/api/v1/reports/{report_id}/accept", headers=primary_headers)
    assert accept.status_code == 200
    assert accept.json()["id"] == report_id
    assert accept.json()["accepted_at"] is not None

    conflict = client.post(f"/api/v1/reports/{report_id}/accept", headers=secondary_headers)
    assert conflict.status_code == 409

    cancel = client.post("/api/v1/reports/active/cancel", headers=primary_headers)
    assert cancel.status_code == 200
    assert cancel.json()["id"] == report_id

    accept_second = client.post(f"/api/v1/reports/{report_id}/accept", headers=secondary_headers)
    assert accept_second.status_code == 200


def test_cannot_accept_new_report_while_one_active():
    headers = _auth_headers(email="busy@example.com")
    first_resp = client.post("/api/v1/reports/", json=_report_payload())
    assert first_resp.status_code == 201
    first_report = first_resp.json()["id"]
    second_resp = client.post(
        "/api/v1/reports/",
        json=_report_payload(full_name="Inny", phone="123123123", report_type_id=2),
    )
    assert second_resp.status_code == 201
    second_report = second_resp.json()["id"]

    assert client.post(f"/api/v1/reports/{first_report}/accept", headers=headers).status_code == 200
    blocked = client.post(f"/api/v1/reports/{second_report}/accept", headers=headers)
    assert blocked.status_code == 400


def test_complete_active_report_updates_counters():
    headers = _auth_headers(email="finisher@example.com")
    create_resp = client.post("/api/v1/reports/", json=_report_payload())
    assert create_resp.status_code == 201
    report_id = create_resp.json()["id"]

    accepted = client.post(f"/api/v1/reports/{report_id}/accept", headers=headers)
    assert accepted.status_code == 200
    assert accepted.json()["accepted_at"] is not None

    done = client.post("/api/v1/reports/active/complete", headers=headers)
    assert done.status_code == 200
    assert done.json()["id"] == report_id

    me = client.get("/api/v1/accounts/me", headers=headers)
    assert me.status_code == 200
    data = me.json()
    assert data["active_report"] is None
    assert data["resolved_cases"] == 1
    assert data["resolved_cases_this_year"] == 1
    assert data["genpoints"] == 10


def test_public_average_response_time_endpoint():
    # No accepted reports yet -> null
    empty = client.get("/api/v1/reports/metrics/avg-response-time")
    assert empty.status_code == 200
    assert empty.json()["average_response_minutes"] is None

    headers = _auth_headers(email="metrics@example.com")

    first_resp = client.post("/api/v1/reports/", json=_report_payload())
    assert first_resp.status_code == 201
    first_id = first_resp.json()["id"]
    second_resp = client.post(
        "/api/v1/reports/",
        json=_report_payload(full_name="Druga", phone="321321321"),
    )
    assert second_resp.status_code == 201
    second_id = second_resp.json()["id"]


def test_my_accepted_endpoint_returns_id_or_null():
    headers = _auth_headers(email="helper@example.com")

    empty = client.get("/api/v1/reports/my-accepted-report", headers=headers)
    assert empty.status_code == 200
    assert empty.json()["report_id"] is None

    create_resp = client.post("/api/v1/reports/", json=_report_payload())
    assert create_resp.status_code == 201
    report_id = create_resp.json()["id"]

    assert client.post(f"/api/v1/reports/{report_id}/accept", headers=headers).status_code == 200

    filled = client.get("/api/v1/reports/my-accepted-report", headers=headers)
    assert filled.status_code == 200
    assert filled.json()["report_id"] == report_id


def test_my_completed_endpoint_lists_finished_reports():
    headers = _auth_headers(email="completionist@example.com")

    first_resp = client.post("/api/v1/reports/", json=_report_payload())
    assert first_resp.status_code == 201
    first_id = first_resp.json()["id"]

    second_resp = client.post(
        "/api/v1/reports/",
        json=_report_payload(full_name="Second", phone="111222333"),
    )
    assert second_resp.status_code == 201
    second_id = second_resp.json()["id"]

    assert client.post(f"/api/v1/reports/{first_id}/accept", headers=headers).status_code == 200
    assert client.post("/api/v1/reports/active/complete", headers=headers).status_code == 200

    assert client.post(f"/api/v1/reports/{second_id}/accept", headers=headers).status_code == 200
    assert client.post("/api/v1/reports/active/complete", headers=headers).status_code == 200

    completed = client.get("/api/v1/reports/my-completed-reports", headers=headers)
    assert completed.status_code == 200
    items = completed.json()
    assert len(items) == 2
    assert items[0]["id"] == second_id
    assert items[1]["id"] == first_id
    assert items[0]["completed_by_email"] == "completionist@example.com"
def test_delete_my_account():
    _register_account()
    login = _login_account()
    token = login.json()["access_token"]

    response = client.delete(
        "/api/v1/accounts/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 204

    # Token should no longer be valid for account retrieval
    response = client.get(
        "/api/v1/accounts/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 401


def test_reporter_reports_removed_endpoint():
    headers = _auth_headers()
    response = client.get(
        "/api/v1/reports/reporter/jan.kowalski@example.com",
        headers=headers,
    )
    # Removed endpoints return 404 Not Found
    assert response.status_code == 404


def test_update_my_account_requires_token_and_updates():
    _register_account()
    login = _login_account()
    token = login.json()["access_token"]

    # Update should require token
    response = client.put(
        "/api/v1/accounts/me",
        json={"city": "Krakow"}
    )
    assert response.status_code == 401

    # With token it updates
    response = client.put(
        "/api/v1/accounts/me",
        headers={"Authorization": f"Bearer {token}"},
        json={"city": "Krakow"}
    )
    assert response.status_code == 200
    assert response.json()["city"] == "Krakow"

    # Verify via GET /me
    response = client.get("/api/v1/accounts/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["city"] == "Krakow"
