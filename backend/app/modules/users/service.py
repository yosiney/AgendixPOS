"""Lógica de negocio de los usuarios de una empresa (tenant)."""

from bson import ObjectId
from pymongo.asynchronous.database import AsyncDatabase
from pymongo.errors import DuplicateKeyError

from app.core.exceptions import BadRequestError, ConflictError, NotFoundError
from app.core.security import hash_password
from app.modules.users.repository import UserRepository
from app.modules.users.schemas import UserCreate, UserResponse, UserUpdate
from app.shared.repository import to_object_id
from app.shared.schemas import PaginatedResponse, PaginationParams

EMAIL_ALREADY_REGISTERED = "Ya existe un usuario registrado con ese email."
USER_NOT_FOUND = "Usuario no encontrado."


class UserService:
    def __init__(self, database: AsyncDatabase, tenant_id: ObjectId) -> None:
        self.users = UserRepository(database, tenant_id)

    async def list_users(self, pagination: PaginationParams) -> PaginatedResponse[UserResponse]:
        documents = await self.users.find_many(
            skip=pagination.skip,
            limit=pagination.limit,
            sort=[("created_at", -1)],
        )
        return PaginatedResponse(
            items=[UserResponse.model_validate(document) for document in documents],
            total=await self.users.count(),
            skip=pagination.skip,
            limit=pagination.limit,
        )

    async def get_user(self, user_id: str) -> UserResponse:
        document = await self.users.find_by_id(user_id)
        if document is None:
            raise NotFoundError(USER_NOT_FOUND)
        return UserResponse.model_validate(document)

    async def create_user(self, data: UserCreate) -> UserResponse:
        document = {
            "email": data.email,
            "full_name": data.full_name,
            "password_hash": await hash_password(data.password),
            "role": data.role,
            "is_active": True,
        }
        try:
            created = await self.users.insert_one(document)
        except DuplicateKeyError as error:
            raise ConflictError(EMAIL_ALREADY_REGISTERED) from error
        return UserResponse.model_validate(created)

    async def update_user(self, user_id: str, data: UserUpdate, acting_user_id: ObjectId) -> UserResponse:
        values = data.model_dump(exclude_unset=True)
        if not values:
            raise BadRequestError("No se enviaron campos para actualizar.")

        # Evita que un administrador se quite el acceso a sí mismo por error.
        is_own_account = to_object_id(user_id) == acting_user_id
        if is_own_account and ("role" in values or "is_active" in values):
            raise BadRequestError("No puedes cambiar tu propio rol ni desactivar tu propia cuenta.")

        if "password" in values:
            values["password_hash"] = await hash_password(values.pop("password"))

        try:
            updated = await self.users.update_by_id(user_id, values)
        except DuplicateKeyError as error:
            raise ConflictError(EMAIL_ALREADY_REGISTERED) from error
        if updated is None:
            raise NotFoundError(USER_NOT_FOUND)
        return UserResponse.model_validate(updated)
