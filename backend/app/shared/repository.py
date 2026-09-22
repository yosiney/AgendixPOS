"""Acceso a datos base para MongoDB.

- BaseRepository: colecciones globales de la plataforma (por ejemplo `tenants`).
- TenantScopedRepository: colecciones cuyos documentos pertenecen a una empresa.
  Agrega `tenant_id` automáticamente a TODAS las consultas y escrituras, por lo
  que desde este repositorio no es posible leer ni modificar datos de otro tenant.

Los módulos de negocio (productos, ventas, clientes, etc.) deben heredar de
TenantScopedRepository.
"""

from datetime import UTC, datetime
from typing import Any

from bson import ObjectId
from bson.errors import InvalidId
from pymongo import ReturnDocument
from pymongo.asynchronous.collection import AsyncCollection
from pymongo.asynchronous.database import AsyncDatabase

Document = dict[str, Any]
SortSpec = list[tuple[str, int]]


def to_object_id(value: str | ObjectId | None) -> ObjectId | None:
    """Convierte un id a ObjectId. Devuelve None si el valor no es un id válido."""
    if value is None:
        return None
    if isinstance(value, ObjectId):
        return value
    try:
        return ObjectId(value)
    except (InvalidId, TypeError):
        return None


def utc_now() -> datetime:
    return datetime.now(UTC)


class BaseRepository:
    collection_name: str

    def __init__(self, database: AsyncDatabase) -> None:
        self.collection: AsyncCollection = database[self.collection_name]

    # --- Puntos de extensión (TenantScopedRepository los sobrescribe) ---

    def _build_filter(self, filters: Document | None = None) -> Document:
        return dict(filters or {})

    def _prepare_insert(self, document: Document) -> Document:
        return dict(document)

    def _prepare_update(self, values: Document) -> Document:
        return {key: value for key, value in values.items() if key != "_id"}

    # --- Operaciones ---

    async def find_one(self, filters: Document) -> Document | None:
        return await self.collection.find_one(self._build_filter(filters))

    async def find_by_id(self, document_id: str | ObjectId) -> Document | None:
        object_id = to_object_id(document_id)
        if object_id is None:
            return None
        return await self.find_one({"_id": object_id})

    async def find_many(
        self,
        filters: Document | None = None,
        *,
        skip: int = 0,
        limit: int = 20,
        sort: SortSpec | None = None,
    ) -> list[Document]:
        cursor = self.collection.find(self._build_filter(filters), skip=skip, limit=limit, sort=sort)
        return await cursor.to_list()

    async def count(self, filters: Document | None = None) -> int:
        return await self.collection.count_documents(self._build_filter(filters))

    async def insert_one(self, document: Document) -> Document:
        now = utc_now()
        new_document = {**self._prepare_insert(document), "created_at": now, "updated_at": now}
        result = await self.collection.insert_one(new_document)
        new_document["_id"] = result.inserted_id
        return new_document

    async def update_by_id(self, document_id: str | ObjectId, values: Document) -> Document | None:
        """Actualiza los campos indicados y devuelve el documento actualizado (None si no existe)."""
        object_id = to_object_id(document_id)
        if object_id is None:
            return None
        changes = {**self._prepare_update(values), "updated_at": utc_now()}
        return await self.collection.find_one_and_update(
            self._build_filter({"_id": object_id}),
            {"$set": changes},
            return_document=ReturnDocument.AFTER,
        )

    async def delete_by_id(self, document_id: str | ObjectId) -> bool:
        object_id = to_object_id(document_id)
        if object_id is None:
            return False
        result = await self.collection.delete_one(self._build_filter({"_id": object_id}))
        return result.deleted_count == 1


class TenantScopedRepository(BaseRepository):
    """Repositorio limitado a los documentos de una sola empresa."""

    def __init__(self, database: AsyncDatabase, tenant_id: ObjectId) -> None:
        if not isinstance(tenant_id, ObjectId):
            raise ValueError("TenantScopedRepository requiere un tenant_id válido.")
        super().__init__(database)
        self.tenant_id = tenant_id

    def _build_filter(self, filters: Document | None = None) -> Document:
        # `tenant_id` va al final para que ningún filtro recibido pueda reemplazarlo.
        return {**(filters or {}), "tenant_id": self.tenant_id}

    def _prepare_insert(self, document: Document) -> Document:
        return {**document, "tenant_id": self.tenant_id}

    def _prepare_update(self, values: Document) -> Document:
        # Un documento nunca puede moverse a otro tenant.
        return {key: value for key, value in super()._prepare_update(values).items() if key != "tenant_id"}
