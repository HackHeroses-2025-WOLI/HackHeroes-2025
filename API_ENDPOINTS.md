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

Account responses returned by authenticated endpoints now expose a `genpoints` counter so volunteers can track earned credit (+10 per completed report).

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

Availability can only be configured through this endpoint. Provide an array of `availability` slots to change schedule data.

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

## 📋 REPORTS - /api/v1/endpoints/reports

> **Authorization:** All report endpoints except `POST /api/v1/reports/` require the `Authorization: Bearer <token>` header obtained from `/api/v1/accounts/login`.
Reports are submitted publicly (no token required for creation).

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

**Errors:**

- `422 Unprocessable Entity` – invalid phone number, too-short description, itp. (format like in  „Error Payload Format”).

### GET /api/v1/reports/

Get all available reports (pagination + filters). This endpoint returns only reports that are **neither currently assigned to a volunteer nor already completed**, making it perfect for displaying work available to be picked up.

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

Statistics for pending, unassigned reports (not completed and not accepted by any volunteer).

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

Public metric endpoint returning average response time.
No authentication required.

```bash
curl http://localhost:8000/api/v1/reports/metrics/avg-response-time
```

Response:

```json
{ "average_response_minutes": 47.5 }
```

If no report has been accepted yet, the value is `null`.

### GET /api/v1/reports/my-accepted-report

Authenticated helper returning the ID of the report currently assigned to you (or `null` if none).

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

Get full report data for all reports completed by you (requires auth, supports `skip`/`limit` pagination).

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

Accept a report (requires auth). Only one volunteer can own a report at a time; the endpoint returns HTTP `409` if somebody else already works on it, or `400` if you already have another active report.

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

Release your currently assigned report so another volunteer may take it.

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

Mark the active report as completed. This clears `active_report`, increments the `resolved_cases` counters, and awards **+10 genpoints** (displayed on `/api/v1/accounts/me`).

```bash
curl -X POST http://localhost:8000/api/v1/reports/active/complete \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Errors:**

- `400 Bad Request` – no active report to complete.
- `401 Unauthorized` – token missing.
- `404 Not Found` – referenced report was removed; the active flag is cleared.

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
  {"id": 1, "name": "Phone", "description": "Problems with using mobile device"},
  
]
```

## 📚 API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc
- **OpenAPI JSON**: http://localhost:8000/api/openapi.json

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
