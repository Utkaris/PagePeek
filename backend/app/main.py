from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.auth import router as auth_router
from app.api.routes.previews import router as previews_router
from app.core.config import settings

app = FastAPI(
    title=settings.APP_NAME,
    description="PagePeek - High performance website URL preview and screenshot service",
    version="1.0.0",
)

origins = list({
    settings.FRONTEND_ORIGIN,
    "https://page-peek-smoky.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
})

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(previews_router)


@app.get("/")
async def root():
    return {
        "message": f"Welcome to {settings.APP_NAME} API",
        "status": "running",
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy",
    }
