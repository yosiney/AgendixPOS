"""Configuración de la aplicación.

Los valores se leen desde variables de entorno. En desarrollo local también se
leen desde el archivo `.env` (ver `.env.example`). Nunca colocar credenciales
directamente en el código.
"""

from pydantic import Field, SecretStr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

API_V1_PREFIX = "/api/v1"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # MongoDB
    mongodb_url: SecretStr
    mongodb_database: str

    # Autenticación (JWT)
    jwt_secret_key: SecretStr
    access_token_expire_minutes: int = Field(default=60, gt=0)

    # CORS: orígenes del frontend permitidos, separados por coma.
    cors_origins: str = ""

    @field_validator("mongodb_url", "mongodb_database", "jwt_secret_key")
    @classmethod
    def validate_required(cls, value: str | SecretStr) -> str | SecretStr:
        raw_value = value.get_secret_value() if isinstance(value, SecretStr) else value
        if not raw_value.strip():
            raise ValueError("Variable de entorno obligatoria sin configurar.")
        return value

    @field_validator("jwt_secret_key")
    @classmethod
    def validate_jwt_secret_length(cls, value: SecretStr) -> SecretStr:
        if len(value.get_secret_value()) < 32:
            raise ValueError("JWT_SECRET_KEY debe tener al menos 32 caracteres.")
        return value

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
