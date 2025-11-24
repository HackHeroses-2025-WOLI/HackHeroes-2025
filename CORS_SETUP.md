# CORS Configuration Guide

## Problem Description

CORS (Cross-Origin Resource Sharing) errors occur when a frontend application hosted on one domain tries to access an API on a different domain. Browsers send a **preflight request** (OPTIONS) before the actual request to check if the server allows cross-origin requests.

## Current Configuration

The backend is configured with CORS middleware that:
- Allows credentials (cookies, authorization headers)
- Allows all HTTP methods (`GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`, etc.)
- Allows all headers (including `Authorization`, `Content-Type`)
- Allows requests from origins specified in `CORS_ORIGINS` environment variable

## How to Configure

### Local Development

Edit `.env` file:
```env
CORS_ORIGINS="http://localhost:3000,http://localhost:8080"
```

### Production (Render.com)

Set environment variable in Render dashboard:
```
CORS_ORIGINS=https://hackheroes-2025-frontend.onrender.com
```

**Important:** Multiple origins can be comma-separated:
```
CORS_ORIGINS=https://frontend.onrender.com,https://app.yourdomain.com
```

## Testing CORS

### Test Preflight Request (PowerShell)

```powershell
curl -i -X OPTIONS "https://hackheroes-2025-backend.onrender.com/api/v1/accounts/login" `
 -H "Origin: https://hackheroes-2025-frontend.onrender.com" `
 -H "Access-Control-Request-Method: POST" `
 -H "Access-Control-Request-Headers: content-type, authorization"
```

### Expected Response

```
HTTP/2 200 
access-control-allow-origin: https://hackheroes-2025-frontend.onrender.com
access-control-allow-credentials: true
access-control-allow-methods: DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT
access-control-allow-headers: accept, authorization, content-type
```

### Test Preflight Request (Bash/Linux/macOS)

```bash
curl -i -X OPTIONS "https://hackheroes-2025-backend.onrender.com/api/v1/accounts/login" \
 -H "Origin: https://hackheroes-2025-frontend.onrender.com" \
 -H "Access-Control-Request-Method: POST" \
 -H "Access-Control-Request-Headers: content-type, authorization"
```

## Troubleshooting

### Issue: 400 Bad Request on OPTIONS

**Symptom:** Browser shows CORS error, preflight returns 400.

**Solution:** 
1. Verify `CORS_ORIGINS` environment variable includes your frontend URL
2. Restart the backend after changing environment variables
3. Check that CORSMiddleware is registered first (already done in `app/main.py`)

### Issue: No Access-Control-Allow-Origin header

**Symptom:** Browser shows "No 'Access-Control-Allow-Origin' header is present"

**Solution:**
1. Check backend logs - is the middleware loaded?
2. Verify `CORS_ORIGINS` is set correctly
3. Test with `curl` to isolate browser vs server issue

### Issue: Credentials not allowed

**Symptom:** "Credentials flag is 'true', but Access-Control-Allow-Credentials is not present"

**Solution:** Already configured - `allow_credentials=True` is set in middleware.

## Security Best Practices

1. **Never use `allow_origins=["*"]` with `allow_credentials=True`** - this is a security risk
2. **Only whitelist trusted frontend domains** in production
3. **Use HTTPS** for all production URLs
4. **Keep CORS_ORIGINS in environment variables**, never hardcode in source

## Current Middleware Configuration

Location: `app/main.py`

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,  # From CORS_ORIGINS env var
    allow_credentials=True,
    allow_methods=["*"],  # All HTTP methods
    allow_headers=["*"],  # All headers including Authorization
)
```

The middleware is registered **immediately after** FastAPI app creation, before any routes or exception handlers, ensuring it processes OPTIONS requests correctly.
