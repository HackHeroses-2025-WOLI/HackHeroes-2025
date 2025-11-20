# 📋 API Endpoints - Complete List

## Base URL: `http://localhost:8000`

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
Register a new account
```bash
curl -X POST http://localhost:8000/api/v1/accounts/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jan.kowalski@example.com",
    "password": "SecurePass123",
    "full_name": "Jan Kowalski",
    "phone": "123456789",
    "city": "Warsaw",
    "availability_type": 1,
    "availability": [
      {
        "day_of_week": 1,
        "start_time": "08:00",
        "end_time": "16:00",
        "is_active": true
      }
    ]
  }'
```

### POST /api/v1/accounts/login
Login and receive a JWT
```bash
curl -X POST http://localhost:8000/api/v1/accounts/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jan.kowalski@example.com",
    "password": "SecurePass123"
  }'
```

### GET /api/v1/accounts/me
Get your account (requires auth)
```bash
curl http://localhost:8000/api/v1/accounts/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### GET /api/v1/accounts/volunteers/active
Get currently active volunteers (public)
```bash
curl http://localhost:8000/api/v1/accounts/volunteers/active
```

Returns non-sensitive volunteer data, including their declared availability
slots and a computed `is_active_now` flag.

### PUT /api/v1/accounts/me
Update account data
```bash
curl -X PUT http://localhost:8000/api/v1/accounts/me \
  -H "Content-Type: application/json" \
  -d '{
    "city": "Krakow"
  }'
```

### DELETE /api/v1/accounts/me
Delete the authenticated account
```bash
curl -X DELETE http://localhost:8000/api/v1/accounts/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📋 REPORTS - /api/v1/reports

> **All endpoints under `/api/v1/reports` require** `Authorization: Bearer <token>`
> with a valid account token issued via `/api/v1/accounts/login`.

### POST /api/v1/reports/
Create a new report
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
`reporter_email` is NOT set when reports are submitted anonymously; this field will be null.

### GET /api/v1/reports/
Get all reports (pagination + filters)
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

### GET /api/v1/reports/stats
Reports statistics
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

### GET /api/v1/reports/{id}
Get a report by ID
```bash
curl http://localhost:8000/api/v1/reports/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### GET /api/v1/reports/reporter/{email}
Removed

### DELETE /api/v1/reports/{id}
Delete a report
```bash
curl -X DELETE http://localhost:8000/api/v1/reports/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🏷️ TYPES - /api/v1/types

### Report Type

#### GET /api/v1/types/report_types
Get all predefined report categories (read-only)
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

##  Podsumowanie

**Total:** 21 endpoints

| Category | Endpoint count |
|-----------|-------------------|
| Accounts | 7 |
| Reports | 6 |
| Report Types | 1 |
| Health | 1 |
| **TOTAL** | **15** |

---

## 🔗 Dokumentacja Interaktywna

Po uruchomieniu serwera odwiedź:
- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc
- **OpenAPI JSON**: http://localhost:8000/api/openapi.json
