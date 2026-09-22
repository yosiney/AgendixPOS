"""Punto de entrada de la aplicación FastAPI."""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.core.database import close_mongo_connection, connect_to_mongo, get_database
from app.core.exceptions import register_exception_handlers
from app.modules.users.repository import create_user_indexes


async def create_indexes() -> None:
    """Crea los índices de MongoDB de cada módulo (operación idempotente)."""
    database = get_database()
    await create_user_indexes(database)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    await connect_to_mongo()
    try:
        await create_indexes()
        yield
    finally:
        await close_mongo_connection()


app = FastAPI(
    title="AgendixPOS API",
    description="API del sistema POS multiempresa.",
    version="0.1.0",
    lifespan=lifespan,
)

if settings.cors_origins_list:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_methods=["*"],
        allow_headers=["*"],
    )

register_exception_handlers(app)
app.include_router(api_router)
