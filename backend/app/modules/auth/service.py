"""Lógica de autenticación: login y validación del usuario de cada petición."""

from bson import ObjectId
from pymongo.asynchronous.database import AsyncDatabase

from app.core.config import settings
from app.core.exceptions import AuthenticationError, PermissionDeniedError
from app.core.roles import Role
from app.core.security import (
    DUMMY_PASSWORD_HASH,
    create_access_token,
    decode_access_token,
    verify_password,
)
from app.modules.auth.schemas import CurrentUser, ProfileResponse, TokenResponse
from app.modules.tenants.repository import TenantRepository
from app.modules.tenants.schemas import TenantResponse, TenantStatus
from app.modules.users.repository import GlobalUserRepository
from app.modules.users.schemas import UserResponse
from app.shared.repository import Document

INVALID_CREDENTIALS = "Email o contraseña incorrectos."


class AuthService:
    def __init__(self, database: AsyncDatabase) -> None:
        self.users = GlobalUserRepository(database)
        self.tenants = TenantRepository(database)

    async def login(self, email: str, password: str) -> TokenResponse:
        user = await self.users.find_by_email(email)
        if user is None:
            await verify_password(password, DUMMY_PASSWORD_HASH)
            raise AuthenticationError(INVALID_CREDENTIALS)
        if not await verify_password(password, user["password_hash"]):
            raise AuthenticationError(INVALID_CREDENTIALS)
        if not user.get("is_active", False):
            raise PermissionDeniedError("Tu usuario está desactivado. Contacta al administrador.")

        tenant_id = user.get("tenant_id")
        if tenant_id is not None:
            await self._get_active_tenant(tenant_id)

        access_token = create_access_token(
            user_id=str(user["_id"]),
            role=user["role"],
            tenant_id=str(tenant_id) if tenant_id else None,
        )
        return TokenResponse(
            access_token=access_token,
            expires_in=settings.access_token_expire_minutes * 60,
        )

    async def get_user_from_token(self, token: str) -> CurrentUser:
        """Valida el token y vuelve a consultar el usuario y su empresa en la base de datos.

        Así, desactivar un usuario o suspender una empresa tiene efecto inmediato,
        sin esperar a que el token expire.
        """
        payload = decode_access_token(token)

        user = await self.users.find_by_id(payload["sub"])
        if user is None or not user.get("is_active", False):
            raise AuthenticationError("Usuario no válido o desactivado.")

        tenant_id = user.get("tenant_id")
        if tenant_id is not None:
            await self._get_active_tenant(tenant_id)

        return CurrentUser(
            id=user["_id"],
            tenant_id=tenant_id,
            email=user["email"],
            role=Role(user["role"]),
        )

    async def get_profile(self, current_user: CurrentUser) -> ProfileResponse:
        user = await self.users.find_by_id(current_user.id)
        if user is None:
            raise AuthenticationError("Usuario no válido o desactivado.")

        tenant = None
        if current_user.tenant_id is not None:
            tenant = TenantResponse.model_validate(await self._get_active_tenant(current_user.tenant_id))

        return ProfileResponse(
            user=UserResponse.model_validate(user),
            tenant=tenant,
            permissions=sorted(current_user.permissions),
        )

    async def _get_active_tenant(self, tenant_id: ObjectId) -> Document:
        tenant = await self.tenants.find_by_id(tenant_id)
        if tenant is None or tenant.get("status") != TenantStatus.ACTIVE:
            raise PermissionDeniedError("La empresa no está activa. Contacta al administrador de la plataforma.")
        return tenant
