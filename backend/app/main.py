"""Main FastAPI application."""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse

from app.config import settings
from app.db.database import engine, Base, SessionLocal
from app.api.v1.router import api_router
from app.services.type_service import ReportTypeService

# Configure logging
logging.basicConfig(
    level=logging.INFO if settings.DEBUG else logging.WARNING,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Create database tables
Base.metadata.create_all(bind=engine)

# Lifespan handler for startup/shutdown logging
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"Debug mode: {settings.DEBUG}")
    logger.info(f"Database: {settings.DATABASE_URL}")
    try:
        with SessionLocal() as db:
            ReportTypeService.ensure_default_types(db)
            logger.info("Default report categories ensured")
    except Exception as exc:  # pragma: no cover - startup failures halt the app
        logger.exception("Failed to seed default report categories: %s", exc)
        raise
    try:
        yield
    finally:
        logger.info(f"Shutting down {settings.APP_NAME}")


# Initialize FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Professional backend API for HackHeroes 2025",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors with detailed messages."""
    logger.warning(f"Validation error: {exc.errors()}")

    sanitized_errors = []
    for error in exc.errors():
        error_copy = error.copy()
        ctx = error_copy.get("ctx")
        if isinstance(ctx, dict) and "error" in ctx and isinstance(ctx["error"], Exception):
            error_copy["ctx"] = ctx.copy()
            error_copy["ctx"]["error"] = str(ctx["error"])
        sanitized_errors.append(error_copy)

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
        content={
            "detail": sanitized_errors,
            "message": "Validation error occurred"
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected errors."""
    logger.error(f"Unexpected error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Internal server error",
            "message": str(exc) if settings.DEBUG else "An unexpected error occurred"
        }
    )


# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "OK",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION
    }


@app.get("/", include_in_schema=False)
async def root_redirect():
    return RedirectResponse(url="/health")


# Include API v1 router
app.include_router(api_router, prefix="/api/v1")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
