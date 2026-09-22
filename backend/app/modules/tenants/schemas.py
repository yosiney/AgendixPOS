"""Esquemas de entrada y salida del módulo de empresas (tenants)."""

from enum import StrEnum
from typing import Annotated, Any

from pydantic import BaseModel, StringConstraints, field_validator

from app.modules.users.schemas import PasswordStr, UserResponse
from app.shared.schemas import DocumentResponse, NameStr, NormalizedEmail, RequestSchema

ShortText = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=30)]


class BusinessType(StrEnum):
    """Tipo de negocio. Es informativo: ninguna lógica depende de este valor."""

    MOTORCYCLE_PARTS = "motorcycle_parts"
    BICYCLE_PARTS = "bicycle_parts"
    SUPERMARKET = "supermarket"
    RETAIL_STORE = "retail_store"
    OTHER = "other"


class TenantStatus(StrEnum):
    ACTIVE = "active"
    SUSPENDED = "suspended"  # Sus usuarios no pueden iniciar sesión ni usar la API.


class TenantAdminCreate(RequestSchema):
    """Datos del primer administrador de la empresa."""

    email: NormalizedEmail
    full_name: NameStr
    password: PasswordStr


class TenantCreate(RequestSchema):
    name: NameStr
    business_type: BusinessType = BusinessType.OTHER
    tax_id: ShortText | None = None
    email: NormalizedEmail | None = None
    phone: ShortText | None = None
    admin: TenantAdminCreate


class TenantUpdate(RequestSchema):
    """Todos los campos son opcionales: solo se actualizan los que se envían.

    `tax_id`, `email` y `phone` aceptan `null` para borrar el valor.
    """

    name: NameStr | None = None
    business_type: BusinessType | None = None
    tax_id: ShortText | None = None
    email: NormalizedEmail | None = None
    phone: ShortText | None = None
    status: TenantStatus | None = None

    @field_validator("name", "business_type", "status")
    @classmethod
    def reject_null(cls, value: Any) -> Any:
        if value is None:
            raise ValueError("Este campo no puede ser nulo.")
        return value


class TenantResponse(DocumentResponse):
    name: str
    business_type: BusinessType
    tax_id: str | None = None
    email: str | None = None
    phone: str | None = None
    status: TenantStatus


class TenantCreatedResponse(BaseModel):
    tenant: TenantResponse
    admin: UserResponse
