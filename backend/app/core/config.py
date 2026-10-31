from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "Pagepeek"
    ENVIRONMENT: str = "development"

    DATABASE_URL: str
    SECRET_KEY: str

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    FRONTEND_ORIGIN: str = "http://localhost:5173"
    SCREENSHOT_DIR: str = "storage/screenshots"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()