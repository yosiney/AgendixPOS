"""Dependencias de autenticación y autorización para proteger endpoints.

Uso en un endpoint:
    - `CurrentUserDep`: requiere un usuario autenticado.
    - `TenantUserDep`: requiere un usuario que pertenezca a una empresa.
    - `Depends(require_permission(Permission.X))`: requiere un permiso concreto.
"""

from collections.abc import Awaitable, Callable
from typing import Annotated

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer

from app.core.config import API_V1_PREFIX
from app.core.database import DatabaseDep
from app.core.exceptions import AuthenticationError, PermissionDeniedError
from app.core.permissions import Permission
from app.modules.auth.schemas import CurrentUser
from app.modules.auth.service import AuthService

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{API_V1_PREFIX}/auth/login", auto_error=False)


async def get_current_user(
    token: Annotated[str | None, Depends(oauth2_scheme)],
    database: DatabaseDep,
) -> CurrentUser:
    if not token:
        raise AuthenticationError()
    return await AuthService(database).get_user_from_token(token)


CurrentUserDep = Annotated[CurrentUser, Depends(get_current_user)]


async def get_current_tenant_user(current_user: CurrentUserDep) -> CurrentUser:
    if current_user.tenant_id is None:
        raise PermissionDeniedError("Esta operación solo está disponible para usuarios de una empresa.")
    return current_user


TenantUserDep = Annotated[CurrentUser, Depends(get_current_tenant_user)]


def require_permission(permission: Permission) -> Callable[..., Awaitable[CurrentUser]]:
    async def check_permission(current_user: CurrentUserDep) -> CurrentUser:
        if not current_user.has_permission(permission):
            raise PermissionDeniedError()
        return current_user

    return check_permission
