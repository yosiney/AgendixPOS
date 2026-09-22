"""Esquemas de entrada y salida del módulo de usuarios."""

from typing import Annotated, Any

from pydantic import StringConstraints, field_validator

from app.core.roles import Role, TenantRole
from app.shared.schemas import (
    DocumentResponse,
    NameStr,
    NormalizedEmail,
    ObjectIdStr,
    RequestSchema,
)

PasswordStr = Annotated[str, StringConstraints(min_length=8, max_length=128)]


class UserCreate(RequestSchema):
    email: NormalizedEmail
    full_name: NameStr
    password: PasswordStr
    role: TenantRole = TenantRole.EMPLOYEE


class UserUpdate(RequestSchema):
    """Todos los campos son opcionales: solo se actualizan los que se envían."""

    email: NormalizedEmail | None = None
    full_name: NameStr | None = None
    password: PasswordStr | None = None
    role: TenantRole | None = None
    is_active: bool | None = None

    @field_validator("*")
    @classmethod
    def reject_null(cls, value: Any) -> Any:
        if value is None:
            raise ValueError("Este campo no puede ser nulo.")
        return value


class UserResponse(DocumentResponse):
    tenant_id: ObjectIdStr | None = None
    email: str
    full_name: str
    role: Role
    is_active: bool
