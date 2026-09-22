"""Endpoints de administración de empresas (tenants). Solo para el Super Admin."""

from typing import Annotated

from fastapi import APIRouter, Depends, Query, status

from app.core.database import DatabaseDep
from app.core.permissions import Permission
from app.modules.auth.dependencies import require_permission
from app.modules.tenants.schemas import (
    TenantCreate,
    TenantCreatedResponse,
    TenantResponse,
    TenantUpdate,
)
from app.modules.tenants.service import TenantService
from app.shared.schemas import PaginatedResponse, PaginationParams

router = APIRouter(
    prefix="/tenants",
    tags=["Empresas (Super Admin)"],
    dependencies=[Depends(require_permission(Permission.TENANTS_MANAGE))],
)


def get_tenant_service(database: DatabaseDep) -> TenantService:
    return TenantService(database)


TenantServiceDep = Annotated[TenantService, Depends(get_tenant_service)]


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_tenant(data: TenantCreate, service: TenantServiceDep) -> TenantCreatedResponse:
    """Crea una empresa junto con su primer usuario administrador."""
    return await service.create_tenant(data)


@router.get("")
async def list_tenants(
    service: TenantServiceDep,
    pagination: Annotated[PaginationParams, Query()],
) -> PaginatedResponse[TenantResponse]:
    return await service.list_tenants(pagination)


@router.get("/{tenant_id}")
async def get_tenant(tenant_id: str, service: TenantServiceDep) -> TenantResponse:
    return await service.get_tenant(tenant_id)


@router.patch("/{tenant_id}")
async def update_tenant(tenant_id: str, data: TenantUpdate, service: TenantServiceDep) -> TenantResponse:
    """Actualiza datos de la empresa. Con `status: "suspended"` se bloquea el acceso de todos sus usuarios."""
    return await service.update_tenant(tenant_id, data)
