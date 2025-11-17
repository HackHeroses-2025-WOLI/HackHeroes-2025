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
    "availability_type": 1
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

### GET /api/v1/accounts/{email}
Get an account by email
```bash
curl http://localhost:8000/api/v1/accounts/jan.kowalski@example.com
```

### GET /api/v1/accounts/?skip=0&limit=100
Get all accounts (pagination)
```bash
curl "http://localhost:8000/api/v1/accounts/?skip=0&limit=20"
```

### PUT /api/v1/accounts/{email}
Update account data
```bash
curl -X PUT http://localhost:8000/api/v1/accounts/jan.kowalski@example.com \
  -H "Content-Type: application/json" \
  -d '{
    "city": "Krakow"
  }'
```

### DELETE /api/v1/accounts/{email}
Delete account
```bash
curl -X DELETE http://localhost:8000/api/v1/accounts/jan.kowalski@example.com
```

---

## 📋 REPORTS - /api/v1/reports

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

### GET /api/v1/reports/
Get all reports (pagination + filters)
```bash
# All reports
curl http://localhost:8000/api/v1/reports/

# With city filter
curl "http://localhost:8000/api/v1/reports/?city=Warsaw"

# With type filter and a limit
curl "http://localhost:8000/api/v1/reports/?report_type_id=1&limit=50"

# With full-text search and date range
curl "http://localhost:8000/api/v1/reports/?search=winda&date_from=2025-01-01&date_to=2025-12-31"
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
curl http://localhost:8000/api/v1/reports/stats
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
curl http://localhost:8000/api/v1/reports/1
```

### GET /api/v1/reports/reporter/{email}
Get a user's reports
```bash
curl http://localhost:8000/api/v1/reports/reporter/jan.kowalski@example.com
```

### PUT /api/v1/reports/{id}
Update a report
```bash
curl -X PUT http://localhost:8000/api/v1/reports/1 \
  -H "Content-Type: application/json" \
  -d '{
    "problem": "Zaktualizowany opis problemu"
  }'
```

### DELETE /api/v1/reports/{id}
Delete a report
```bash
curl -X DELETE http://localhost:8000/api/v1/reports/1
```

---

## 🏷️ TYPES - /api/v1/types

### Typ Dostępności

#### GET /api/v1/types/availability
Get all availability types
```bash
curl http://localhost:8000/api/v1/types/availability
```

#### GET /api/v1/types/availability/{id}
Get availability type by ID
```bash
curl http://localhost:8000/api/v1/types/availability/1
```

#### POST /api/v1/types/availability
Create a new availability type
```bash
curl -X POST http://localhost:8000/api/v1/types/availability \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Blind",
    "description": "Blind user using a screen reader"
  }'
```

### Report Type

#### GET /api/v1/types/report_types
Get all report types
```bash
curl http://localhost:8000/api/v1/types/report_types
```

#### GET /api/v1/types/report_types/{id}
Get report type by ID
```bash
curl http://localhost:8000/api/v1/types/report_types/1
```

#### POST /api/v1/types/report_types
Create a new report type
```bash
curl -X POST http://localhost:8000/api/v1/types/report_types \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Architectural barriers",
    "description": "Issues with building accessibility"
  }'
```

---

##  Podsumowanie

**Total:** 21 endpoints

| Category | Endpoint count |
|-----------|-------------------|
| Accounts | 7 |
| Reports | 7 |
| Availability Types | 3 |
| Report Types | 3 |
| Health | 1 |
| **TOTAL** | **21** |

---

## 🔗 Dokumentacja Interaktywna

Po uruchomieniu serwera odwiedź:
- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc
- **OpenAPI JSON**: http://localhost:8000/api/openapi.json
