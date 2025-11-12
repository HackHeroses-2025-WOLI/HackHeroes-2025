# 📋 API Endpoints - Kompletna Lista

## Base URL: `http://localhost:8000`

---

## 🏥 HEALTH CHECK

### GET /health
Sprawdź status API
```bash
curl http://localhost:8000/health
```

---

## 👥 KONTA (Accounts) - /api/v1/konta

### POST /api/v1/konta/register
Rejestracja nowego konta
```bash
curl -X POST http://localhost:8000/api/v1/konta/register \
  -H "Content-Type: application/json" \
  -d '{
    "login_email": "jan.kowalski@example.com",
    "haslo": "SecurePass123",
    "imie_nazwisko": "Jan Kowalski",
    "nr_tel": "123456789",
    "miejscowosc": "Warszawa",
    "typ_dostepnosci": 1
  }'
```

### POST /api/v1/konta/login
Logowanie i otrzymanie tokenu JWT
```bash
curl -X POST http://localhost:8000/api/v1/konta/login \
  -H "Content-Type: application/json" \
  -d '{
    "login_email": "jan.kowalski@example.com",
    "haslo": "SecurePass123"
  }'
```

### GET /api/v1/konta/me
Pobierz swoje konto (wymaga autoryzacji)
```bash
curl http://localhost:8000/api/v1/konta/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### GET /api/v1/konta/{email}
Pobierz konto po emailu
```bash
curl http://localhost:8000/api/v1/konta/jan.kowalski@example.com
```

### GET /api/v1/konta/?skip=0&limit=100
Pobierz wszystkie konta (paginacja)
```bash
curl "http://localhost:8000/api/v1/konta/?skip=0&limit=20"
```

### PUT /api/v1/konta/{email}
Aktualizuj dane konta
```bash
curl -X PUT http://localhost:8000/api/v1/konta/jan.kowalski@example.com \
  -H "Content-Type: application/json" \
  -d '{
    "miejscowosc": "Kraków"
  }'
```

### DELETE /api/v1/konta/{email}
Usuń konto
```bash
curl -X DELETE http://localhost:8000/api/v1/konta/jan.kowalski@example.com
```

---

## 📋 ZGŁOSZENIA (Reports) - /api/v1/zgloszenia

### POST /api/v1/zgloszenia/
Utwórz nowe zgłoszenie
```bash
curl -X POST http://localhost:8000/api/v1/zgloszenia/ \
  -H "Content-Type: application/json" \
  -d '{
    "imie_nazwisko": "Anna Nowak",
    "nr_tel": "987654321",
    "wiek": 45,
    "adres": "ul. Przykładowa 10",
    "miejscowosc": "Kraków",
    "problem": "Brak podjazdu dla wózków inwalidzkich",
    "czy_do_kontaktu": true,
    "typ_zgloszenia_id": 1,
    "zgloszenie_szczegoly": "Wejście główne do budynku..."
  }'
```

### GET /api/v1/zgloszenia/
Pobierz wszystkie zgłoszenia (z filtrami)
```bash
# Wszystkie zgłoszenia
curl http://localhost:8000/api/v1/zgloszenia/

# Z filtrem miejscowości
curl "http://localhost:8000/api/v1/zgloszenia/?miejscowosc=Warszawa"

# Z filtrem typu i limitem
curl "http://localhost:8000/api/v1/zgloszenia/?typ_zgloszenia_id=1&limit=50"
```

### GET /api/v1/zgloszenia/stats
Statystyki zgłoszeń
```bash
curl http://localhost:8000/api/v1/zgloszenia/stats
```

### GET /api/v1/zgloszenia/{id}
Pobierz zgłoszenie po ID
```bash
curl http://localhost:8000/api/v1/zgloszenia/1
```

### GET /api/v1/zgloszenia/reporter/{email}
Pobierz zgłoszenia użytkownika
```bash
curl http://localhost:8000/api/v1/zgloszenia/reporter/jan.kowalski@example.com
```

### PUT /api/v1/zgloszenia/{id}
Aktualizuj zgłoszenie
```bash
curl -X PUT http://localhost:8000/api/v1/zgloszenia/1 \
  -H "Content-Type: application/json" \
  -d '{
    "problem": "Zaktualizowany opis problemu"
  }'
```

### DELETE /api/v1/zgloszenia/{id}
Usuń zgłoszenie
```bash
curl -X DELETE http://localhost:8000/api/v1/zgloszenia/1
```

---

## 🏷️ TYPY - /api/v1/typy

### Typ Dostępności

#### GET /api/v1/typy/dostepnosci
Pobierz wszystkie typy dostępności
```bash
curl http://localhost:8000/api/v1/typy/dostepnosci
```

#### GET /api/v1/typy/dostepnosci/{id}
Pobierz typ dostępności po ID
```bash
curl http://localhost:8000/api/v1/typy/dostepnosci/1
```

#### POST /api/v1/typy/dostepnosci
Utwórz nowy typ dostępności
```bash
curl -X POST http://localhost:8000/api/v1/typy/dostepnosci \
  -H "Content-Type: application/json" \
  -d '{
    "nazwa": "Niewidomy",
    "opis": "Użytkownik niewidomy korzystający z czytnika ekranu"
  }'
```

### Typ Zgłoszenia

#### GET /api/v1/typy/zgloszen
Pobierz wszystkie typy zgłoszeń
```bash
curl http://localhost:8000/api/v1/typy/zgloszen
```

#### GET /api/v1/typy/zgloszen/{id}
Pobierz typ zgłoszenia po ID
```bash
curl http://localhost:8000/api/v1/typy/zgloszen/1
```

#### POST /api/v1/typy/zgloszen
Utwórz nowy typ zgłoszenia
```bash
curl -X POST http://localhost:8000/api/v1/typy/zgloszen \
  -H "Content-Type: application/json" \
  -d '{
    "nazwa": "Bariery architektoniczne",
    "opis": "Problemy z dostępnością budynków"
  }'
```

---

## 🔐 LEGACY ENDPOINTS (dla kompatybilności wstecznej)

### POST /api/v1/auth/register
### POST /api/v1/auth/login
### GET /api/v1/users/me
### GET /api/v1/users/{user_id}

---

## 📊 Podsumowanie

**Łącznie:** 26 endpointów

| Kategoria | Liczba endpointów |
|-----------|-------------------|
| Konta | 7 |
| Zgłoszenia | 7 |
| Typy Dostępności | 3 |
| Typy Zgłoszeń | 3 |
| Health | 1 |
| Legacy | 4 |
| **TOTAL** | **25** |

---

## 🔗 Dokumentacja Interaktywna

Po uruchomieniu serwera odwiedź:
- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc
- **OpenAPI JSON**: http://localhost:8000/api/openapi.json
