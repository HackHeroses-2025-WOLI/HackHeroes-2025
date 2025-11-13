"""Script to start the FastAPI application."""
import uvicorn
from app.config import settings

if __name__ == "__main__":
    print(f"""
╔════════════════════════════════════════════════════════════╗
║  🚀 Starting {settings.APP_NAME} v{settings.APP_VERSION}       
║  📝 Documentation: http://localhost:{settings.PORT}/api/docs
║  🔄 ReDoc: http://localhost:{settings.PORT}/api/redoc
║  ❤️  Health: http://localhost:{settings.PORT}/health
╚════════════════════════════════════════════════════════════╝
    """)
    
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info" if settings.DEBUG else "warning"
    )
