"""Conexión centralizada a MongoDB usando el driver asíncrono oficial de PyMongo."""

from typing import Annotated

from fastapi import Depends
from pymongo import AsyncMongoClient
from pymongo.asynchronous.database import AsyncDatabase

from app.core.config import settings

_client: AsyncMongoClient | None = None


async def connect_to_mongo() -> None:
    """Abre la conexión y verifica que MongoDB responda."""
    global _client
    _client = AsyncMongoClient(
        settings.mongodb_url.get_secret_value(),
        tz_aware=True,  # Las fechas se devuelven con zona horaria (UTC).
        serverSelectionTimeoutMS=5000,
    )
    await _client.admin.command("ping")


async def close_mongo_connection() -> None:
    global _client
    if _client is not None:
        await _client.close()
        _client = None


def get_database() -> AsyncDatabase:
    if _client is None:
        raise RuntimeError("La conexión a MongoDB no ha sido inicializada.")
    return _client[settings.mongodb_database]


# Dependencia para inyectar la base de datos en los endpoints.
DatabaseDep = Annotated[AsyncDatabase, Depends(get_database)]
