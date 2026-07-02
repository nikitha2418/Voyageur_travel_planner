"""Application configuration loaded from environment variables."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # --- Groq LLM ---
    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"

    # --- MySQL database ---
    # Example: mysql+pymysql://user:password@host:3306/dbname
    db_host: str = "localhost"
    db_port: int = 3306
    db_user: str = "travel"
    db_password: str = "travel"
    db_name: str = "travel_planner"

    # --- App ---
    cors_origins: str = "*"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def database_url(self) -> str:
        return (
            f"mysql+pymysql://{self.db_user}:{self.db_password}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}?charset=utf8mb4"
        )


settings = Settings()
