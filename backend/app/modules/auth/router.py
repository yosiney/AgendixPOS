"""Endpoints de autenticación."""

from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm

from app.core.database import DatabaseDep
from app.modules.auth.dependencies import CurrentUserDep
from app.modules.auth.schemas import ProfileResponse, TokenResponse
from app.modules.auth.service import AuthService

router = APIRouter(prefix="/auth", tags=["Autenticación"])


def get_auth_service(database: DatabaseDep) -> AuthService:
    return AuthService(database)


AuthServiceDep = Annotated[AuthService, Depends(get_auth_service)]


@router.post("/login")
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    service: AuthServiceDep,
) -> TokenResponse:
    """Inicia sesión con email y contraseña.

    Usa el formato estándar OAuth2 (form-data): el campo `username` es el email.
    """
    return await service.login(form_data.username, form_data.password)


@router.get("/me")
async def get_profile(current_user: CurrentUserDep, service: AuthServiceDep) -> ProfileResponse:
    """Devuelve el usuario autenticado, su empresa y sus permisos."""
    return await service.get_profile(current_user)
