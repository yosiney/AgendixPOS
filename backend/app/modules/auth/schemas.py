"""Esquemas del módulo de autenticación."""

from dataclasses import dataclass

from bson import ObjectId
from pydantic import BaseModel

from app.core.permissions import Permission, get_role_permissions
from app.core.roles import Role
from app.modules.tenants.schemas import TenantResponse
from app.modules.users.schemas import UserResponse


@dataclass(frozen=True)
class CurrentUser:
    """Usuario autenticado en la petición actual (uso interno, no se expone en la API)."""

    id: ObjectId
    tenant_id: ObjectId | None  # None solo para el Super Admin.
    email: str
    role: Role

    @property
    def permissions(self) -> frozenset[Permission]:
        return get_role_permissions(self.role)

    def has_permission(self, permission: Permission) -> bool:
        return permission in self.permissions


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int  # Segundos.


class ProfileResponse(BaseModel):
    user: UserResponse
    tenant: TenantResponse | None
    # Útil para que el frontend muestre u oculte opciones. La seguridad real está en el backend.
    permissions: list[Permission]
