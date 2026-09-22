"""Lógica de negocio de las empresas (tenants). Uso exclusivo del Super Admin."""

from pymongo.asynchronous.database import AsyncDatabase

from app.core.exceptions import BadRequestError, NotFoundError
from app.core.roles import TenantRole
from app.modules.tenants.repository import TenantRepository
from app.modules.tenants.schemas import (
    TenantCreate,
    TenantCreatedResponse,
    TenantResponse,
    TenantStatus,
    TenantUpdate,
)
from app.modules.users.schemas import UserCreate
from app.modules.users.service import UserService
from app.shared.schemas import PaginatedResponse, PaginationParams

TENANT_NOT_FOUND = "Empresa no encontrada."


class TenantService:
    def __init__(self, database: AsyncDatabase) -> None:
        self.database = database
        self.tenants = TenantRepository(database)

    async def create_tenant(self, data: TenantCreate) -> TenantCreatedResponse:
        tenant = await self.tenants.insert_one(
            {**data.model_dump(exclude={"admin"}), "status": TenantStatus.ACTIVE}
        )

        # Se crea el primer administrador. Si falla (por ejemplo, email ya registrado),
        # se elimina la empresa recién creada para no dejarla sin administrador.
        try:
            admin = await UserService(self.database, tenant_id=tenant["_id"]).create_user(
                UserCreate(**data.admin.model_dump(), role=TenantRole.ADMIN)
            )
        except Exception:
            await self.tenants.delete_by_id(tenant["_id"])
            raise

        return TenantCreatedResponse(tenant=TenantResponse.model_validate(tenant), admin=admin)

    async def list_tenants(self, pagination: PaginationParams) -> PaginatedResponse[TenantResponse]:
        documents = await self.tenants.find_many(
            skip=pagination.skip,
            limit=pagination.limit,
            sort=[("created_at", -1)],
        )
        return PaginatedResponse(
            items=[TenantResponse.model_validate(document) for document in documents],
            total=await self.tenants.count(),
            skip=pagination.skip,
            limit=pagination.limit,
        )

    async def get_tenant(self, tenant_id: str) -> TenantResponse:
        document = await self.tenants.find_by_id(tenant_id)
        if document is None:
            raise NotFoundError(TENANT_NOT_FOUND)
        return TenantResponse.model_validate(document)

    async def update_tenant(self, tenant_id: str, data: TenantUpdate) -> TenantResponse:
        values = data.model_dump(exclude_unset=True)
        if not values:
            raise BadRequestError("No se enviaron campos para actualizar.")

        updated = await self.tenants.update_by_id(tenant_id, values)
        if updated is None:
            raise NotFoundError(TENANT_NOT_FOUND)
        return TenantResponse.model_validate(updated)
