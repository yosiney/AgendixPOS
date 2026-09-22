"""Endpoints de usuarios de una empresa.

Operan exclusivamente sobre el tenant del usuario autenticado.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, Query, status

from app.core.database import DatabaseDep
from app.core.permissions import Permission
from app.modules.auth.dependencies import TenantUserDep, require_permission
from app.modules.auth.schemas import CurrentUser
from app.modules.users.schemas import UserCreate, UserResponse, UserUpdate
from app.modules.users.service import UserService
from app.shared.schemas import PaginatedResponse, PaginationParams

router = APIRouter(prefix="/users", tags=["Usuarios"])


def get_user_service(database: DatabaseDep, current_user: TenantUserDep) -> UserService:
    # El servicio queda limitado al tenant del usuario autenticado.
    return UserService(database, tenant_id=current_user.tenant_id)


UserServiceDep = Annotated[UserService, Depends(get_user_service)]


@router.get("", dependencies=[Depends(require_permission(Permission.USERS_READ))])
async def list_users(
    service: UserServiceDep,
    pagination: Annotated[PaginationParams, Query()],
) -> PaginatedResponse[UserResponse]:
    return await service.list_users(pagination)


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permission(Permission.USERS_MANAGE))],
)
async def create_user(data: UserCreate, service: UserServiceDep) -> UserResponse:
    return await service.create_user(data)


@router.get("/{user_id}", dependencies=[Depends(require_permission(Permission.USERS_READ))])
async def get_user(user_id: str, service: UserServiceDep) -> UserResponse:
    return await service.get_user(user_id)


@router.patch("/{user_id}")
async def update_user(
    user_id: str,
    data: UserUpdate,
    service: UserServiceDep,
    current_user: Annotated[CurrentUser, Depends(require_permission(Permission.USERS_MANAGE))],
) -> UserResponse:
    return await service.update_user(user_id, data, acting_user_id=current_user.id)
