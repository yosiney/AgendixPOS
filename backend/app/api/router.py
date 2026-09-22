"""Router principal de la API. Cada módulo nuevo se registra aquí."""

from fastapi import APIRouter

from app.api.health import router as health_router
from app.core.config import API_V1_PREFIX
from app.modules.auth.router import router as auth_router
from app.modules.tenants.router import router as tenants_router
from app.modules.users.router import router as users_router

api_router = APIRouter(prefix=API_V1_PREFIX)

api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(tenants_router)
api_router.include_router(users_router)
