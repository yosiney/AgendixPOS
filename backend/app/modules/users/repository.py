"""Acceso a datos de la colección `users`."""

from pymongo.asynchronous.database import AsyncDatabase

from app.shared.repository import BaseRepository, Document, TenantScopedRepository

USERS_COLLECTION = "users"


class UserRepository(TenantScopedRepository):
    """Usuarios de UNA empresa. Todas las operaciones quedan limitadas a su tenant."""

    collection_name = USERS_COLLECTION


class GlobalUserRepository(BaseRepository):
    """Usuarios sin filtro de tenant.

    Solo debe usarse para la autenticación (login y validación del token) y para
    usuarios de nivel plataforma (Super Admin). Nunca desde endpoints de empresa.
    """

    collection_name = USERS_COLLECTION

    async def find_by_email(self, email: str) -> Document | None:
        return await self.find_one({"email": email.strip().lower()})


async def create_user_indexes(database: AsyncDatabase) -> None:
    collection = database[USERS_COLLECTION]
    # El email es único en toda la plataforma: el login es email + contraseña.
    await collection.create_index("email", unique=True)
    await collection.create_index([("tenant_id", 1), ("created_at", -1)])
