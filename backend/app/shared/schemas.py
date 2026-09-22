"""Esquemas y tipos compartidos por todos los módulos."""

from datetime import datetime
from typing import Annotated, Any, Generic, TypeVar

from bson import ObjectId
from pydantic import (
    AfterValidator,
    AliasChoices,
    BaseModel,
    BeforeValidator,
    ConfigDict,
    EmailStr,
    Field,
    StringConstraints,
)


def _object_id_to_str(value: Any) -> Any:
    return str(value) if isinstance(value, ObjectId) else value


# ObjectId de MongoDB expuesto como string en la API.
ObjectIdStr = Annotated[str, BeforeValidator(_object_id_to_str)]

# Email validado y normalizado a minúsculas.
NormalizedEmail = Annotated[EmailStr, AfterValidator(str.lower)]

# Nombres de personas, empresas, etc.
NameStr = Annotated[str, StringConstraints(strip_whitespace=True, min_length=2, max_length=120)]


class RequestSchema(BaseModel):
    """Base para los datos que envía el cliente.

    `extra="forbid"` rechaza campos no definidos (por ejemplo, un `tenant_id`
    enviado desde el frontend), evitando que se cuelen datos no esperados.
    """

    model_config = ConfigDict(extra="forbid", use_enum_values=True)


class DocumentResponse(BaseModel):
    """Base para respuestas construidas desde documentos de MongoDB (`_id` -> `id`)."""

    id: ObjectIdStr = Field(validation_alias=AliasChoices("_id", "id"))
    created_at: datetime
    updated_at: datetime


class PaginationParams(BaseModel):
    skip: int = Field(default=0, ge=0)
    limit: int = Field(default=20, ge=1, le=100)


ItemType = TypeVar("ItemType")


class PaginatedResponse(BaseModel, Generic[ItemType]):
    items: list[ItemType]
    total: int
    skip: int
    limit: int
