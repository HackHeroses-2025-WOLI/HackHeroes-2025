# 📋 API Endpoints - Complete List

## Base URL: `http://localhost:8000`

---

## ❗ Error Payload Format

Większość endpointów zwraca błędy w jednym z dwóch wariantów:

```json
{
  "detail": [
    {
      "type": "string_too_short",
      "loc": ["body", "field_name"],
      "msg": "String should have at least N characters",
      "input": "...",
      "ctx": {"min_length": N}
    }
  ],
  "message": "Validation error occurred"
}
```

- `ValidationError (422)` – zwracany gdy dane wejściowe łamią walidację Pydantic.
- `HTTPException` – np. `400/401/404`, wówczas `detail` jest napisem, np. `{ "detail": "Account already exists" }`.

W poniższych opisach przy endpointach znajdziesz listę możliwych błędów, jeśli dany zasób może je zwracać.

---

## 🏥 HEALTH CHECK

### GET /health

Check API status

```bash
curl http://localhost:8000/health
```

---

## 👥 ACCOUNTS - /api/v1/accounts

### POST /api/v1/accounts/register

Register a new account.

```bash
curl -X POST http://localhost:8000/api/v1/accounts/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jan.kowalski@example.com",
    "password": "SecurePass123",
    "full_name": "Jan Kowalski",
    "phone": "123456789",
    "city": "Warsaw"
  }'
```

_Availability schedules now default to empty during registration. Configure slots later via `PUT /api/v1/accounts/me`._

**Errors:**

- `400 Bad Request` – account with the provided email already exists.
- `422 Unprocessable Entity` – invalid payload (np. zbyt krótki opis problemu):

  ```json
  {
    "detail": [
      {
        "type": "string_too_short",
        "loc": ["body", "phone"],
        "msg": "Phone number must be 9 digits",
        "input": "12345abc"
      }
    ],
    "message": "Validation error occurred"
  }
  ```

### POST /api/v1/accounts/login

Login and receive a JWT.

```bash
curl -X POST http://localhost:8000/api/v1/accounts/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jan.kowalski@example.com",
    "password": "SecurePass123"
  }'
```

**Errors:**

- `401 Unauthorized` – invalid credentials result in `{ "detail": "Invalid email or password" }`.

### GET /api/v1/accounts/me

Get your account (requires auth).

```bash
curl http://localhost:8000/api/v1/accounts/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Errors:**

- `401 Unauthorized` – missing or invalid bearer token.

### GET /api/v1/accounts/volunteers/active

Get currently active volunteers (public).

```bash
curl http://localhost:8000/api/v1/accounts/volunteers/active
```

Returns non-sensitive volunteer data, including their declared availability
slots and a computed `is_active_now` flag.

Example response:

```json
{
  "total_manual_active": 2,
  "total_scheduled_active": 5,
  "volunteers": [
    {
      "email": "volunteer@example.com",
      "full_name": "Jan Kowalski",
      "is_active": true,
      "schedule_active_now": false,
      "is_active_now": true,
      "availability": []
    }
  ]
}
```

- `is_active` – ręczne ustawienie widoczności (przycisk „dyżur awaryjny”).
- `schedule_active_now` – czy bieżąca godzina mieści się w kalendarzu dostępności.
- `is_active_now` – true, jeśli spełniony jest którykolwiek z powyższych warunków.

### PUT /api/v1/accounts/me

Update account data.

```bash
curl -X PUT http://localhost:8000/api/v1/accounts/me \
  -H "Content-Type: application/json" \
  -d '{
    "city": "Krakow"
  }'
```

_Availability can only be configured through this endpoint. Provide an array of `availability` slots to change schedule data._

Example `availability` payload:

```json
{
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

To quickly appear on the public volunteer list regardless of schedule, toggle
the manual flag:

```bash
curl -X PUT http://localhost:8000/api/v1/accounts/me \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"is_active": true}'
```

**Errors:**

- `401 Unauthorized` – token missing/invalid.
- `422 Unprocessable Entity` – invalid availability slots or other payload issues.

### DELETE /api/v1/accounts/me

Delete the authenticated account.

```bash
curl -X DELETE http://localhost:8000/api/v1/accounts/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Errors:**

- `401 Unauthorized` – invalid/missing token.
- `404 Not Found` – account already deleted (token becomes invalid afterwards).

---

## 📋 REPORTS - /api/v1/reports

> **Authorization:** wszystkie operacje z wyjątkiem `POST /api/v1/reports/` wymagają nagłówka `Authorization: Bearer <token>`.

### POST /api/v1/reports/

Create a new report (public endpoint).

```bash
curl -X POST http://localhost:8000/api/v1/reports/ \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Anna Nowak",
    "phone": "987654321",
    "age": 45,
    "address": "ul. Przykładowa 10",
    "city": "Krakow",
    "problem": "No wheelchair ramp at the main entrance",
    "contact_ok": true,
    "report_type_id": 1,
    "report_details": "Main entrance accessibility issue..."
  }'
```

`reporter_email` is NOT set when reports are submitted anonymously; this field will be `null`.
Response bodies expose an `is_reviewed` boolean flag (default `false`) so internal tools can immediately display triage state.

**Errors:**

- `422 Unprocessable Entity` – invalid phone number, too-short description, itp. (format jak w sekcji „Error Payload Format”).

### GET /api/v1/reports/

Get all available reports (pagination + filters). This endpoint returns only reports that are **neither currently assigned to a volunteer nor already completed**, making it perfect for displaying work available to be picked up. Every record contains the `is_reviewed` flag so operators quickly know which cases require attention.

```bash
# All reports
curl http://localhost:8000/api/v1/reports/ \
  -H "Authorization: Bearer YOUR_TOKEN"

# With city filter
curl "http://localhost:8000/api/v1/reports/?city=Warsaw" \
  -H "Authorization: Bearer YOUR_TOKEN"

# With type filter and a limit
curl "http://localhost:8000/api/v1/reports/?report_type_id=1&limit=50" \
  -H "Authorization: Bearer YOUR_TOKEN"

# With full-text search and date range
curl "http://localhost:8000/api/v1/reports/?search=winda&date_from=2025-01-01&date_to=2025-12-31" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Available filters:**

- `skip`, `limit` – pagination
- `report_type_id` – filter by report type
- `city` – case-insensitive substring match for city
- `search` – full-text search in address and problem description
- `date_from`, `date_to` – report date range (format `YYYY-MM-DD`)

**Errors:**

- `401 Unauthorized` – token required for listing.

### GET /api/v1/reports/stats

Statistics for reports that are still pending and currently unassigned (not accepted by any volunteer).

```bash
curl http://localhost:8000/api/v1/reports/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Przykładowa odpowiedź:

```json
{
  "total_reports": 42,
  "by_type": {
    "1": 30,
    "2": 12
  }
}
```

**Errors:**

- `401 Unauthorized` – requires valid token.

### GET /api/v1/reports/metrics/avg-response-time

Public metric endpoint returning the average number of minutes between `reported_at` and the first acceptance (`accepted_at`). No authentication required.

```bash
curl http://localhost:8000/api/v1/reports/metrics/avg-response-time
```

Response:

```json
{ "average_response_minutes": 47.5 }
```

If no report has been accepted yet, the value is `null`.

### GET /api/v1/reports/my-accepted-report

Return the currently assigned report ID for the authenticated volunteer.

```bash
curl http://localhost:8000/api/v1/reports/my-accepted-report \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response structure:

```json
{ "report_id": 123 }
```

The value is `null` when no report is currently assigned.

### GET /api/v1/reports/my-completed-reports

Return reports that the authenticated volunteer has completed. Supports `skip` and `limit` query parameters for pagination.

```bash
curl "http://localhost:8000/api/v1/reports/my-completed-reports?limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Returns an array of `ReportOut` objects, ordered by completion date (newest first).

**Errors:**

- `401 Unauthorized` – missing/invalid token.

### GET /api/v1/reports/{id}

Get a report by ID.

```bash
curl http://localhost:8000/api/v1/reports/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Errors:**

- `401 Unauthorized` – token missing.
- `404 Not Found` – report with given ID does not exist.

### POST /api/v1/reports/{id}/accept

Accept (assign yourself to) a report. Exactly one volunteer may own a report; attempting to accept an already taken report returns `409 Conflict`.

```bash
curl -X POST http://localhost:8000/api/v1/reports/123/accept \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Errors:**

- `400 Bad Request` – you already work on another active report.
- `401 Unauthorized` – missing/invalid token.
- `404 Not Found` – report does not exist.
- `409 Conflict` – somebody else already accepted this report.

### POST /api/v1/reports/active/cancel

Cancel your current assignment (frees the report for other volunteers).

```bash
curl -X POST http://localhost:8000/api/v1/reports/active/cancel \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response returns the released report body so the UI may update immediately.

**Errors:**

- `400 Bad Request` – no active report to cancel.
- `401 Unauthorized` – token missing.
- `404 Not Found` – stored report id no longer exists (state is cleared).

### POST /api/v1/reports/active/complete

Mark your current assignment as completed. The endpoint clears `active_report`, increments the volunteer's counters, grants **+10 genpoints**, and returns the report payload so dashboards stay in sync.

```bash
curl -X POST http://localhost:8000/api/v1/reports/active/complete \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Errors:**

- `400 Bad Request` – no active report to complete.
- `401 Unauthorized` – token missing.
- `404 Not Found` – referenced report was removed; the active flag is cleared.

### GET /api/v1/reports/reporter/{email}

Removed (endpoint no longer available).

---

## 🏷️ TYPES - /api/v1/types

### Report Type

#### GET /api/v1/types/report_types

Get all predefined report categories (read-only).

```bash
curl http://localhost:8000/api/v1/types/report_types
```

Example response:

```json
[
  {"id": 1, "name": "Aplikacje", "description": "Problemy z aplikacjami"},
  {"id": 2, "name": "Bezpieczeństwo", "description": "Zgłoszenia bezpieczeństwa"},
  {"id": 3, "name": "Kontakt i połączenia", "description": "Trudności komunikacyjne"},
  {"id": 4, "name": "Płatności i bankowość", "description": "Problemy finansowe"},
  {"id": 5, "name": "Inne", "description": "Inne zgłoszenia"}
]
```

---

## Podsumowanie

**Total:** 21 endpoints

| Category | Endpoint count |
|-----------|-------------------|
| Accounts | 7 |
| Reports | 9 |
| Report Types | 1 |
| Health | 1 |
| **TOTAL** | **18** |

---

## 🔗 Dokumentacja Interaktywna

Po uruchomieniu serwera odwiedź:

- **Swagger UI**: [http://localhost:8000/api/docs](http://localhost:8000/api/docs)
- **ReDoc**: [http://localhost:8000/api/redoc](http://localhost:8000/api/redoc)
- **OpenAPI JSON**: [http://localhost:8000/api/openapi.json](http://localhost:8000/api/openapi.json)
