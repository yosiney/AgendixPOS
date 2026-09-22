"""Crea un usuario Super Admin (administrador global de la plataforma).

Uso con Docker (con el contenedor levantado):
    docker compose exec backend python -m app.scripts.create_super_admin

Uso local (desde la carpeta backend/):
    python -m app.scripts.create_super_admin
"""

import asyncio
from getpass import getpass

from pydantic import BaseModel, ValidationError

from app.core.database import close_mongo_connection, connect_to_mongo, get_database
from app.core.roles import Role
from app.core.security import hash_password
from app.modules.users.repository import GlobalUserRepository, create_user_indexes
from app.modules.users.schemas import PasswordStr
from app.shared.schemas import NameStr, NormalizedEmail


class SuperAdminData(BaseModel):
    email: NormalizedEmail
    full_name: NameStr
    password: PasswordStr


def ask_super_admin_data() -> SuperAdminData | None:
    email = input("Email: ")
    full_name = input("Nombre completo: ")
    password = getpass("Contraseña (mínimo 8 caracteres): ")
    if password != getpass("Confirmar contraseña: "):
        print("Las contraseñas no coinciden.")
        return None

    try:
        return SuperAdminData(email=email, full_name=full_name, password=password)
    except ValidationError as error:
        print("Datos inválidos:")
        for detail in error.errors():
            print(f"  - {detail['loc'][0]}: {detail['msg']}")
        return None


async def create_super_admin(data: SuperAdminData) -> None:
    await connect_to_mongo()
    try:
        database = get_database()
        await create_user_indexes(database)

        users = GlobalUserRepository(database)
        if await users.find_by_email(data.email):
            print(f"Ya existe un usuario con el email {data.email}.")
            return

        await users.insert_one({
            "tenant_id": None,
            "email": data.email,
            "full_name": data.full_name,
            "password_hash": await hash_password(data.password),
            "role": Role.SUPER_ADMIN,
            "is_active": True,
        })
        print(f"Super Admin {data.email} creado correctamente.")
    finally:
        await close_mongo_connection()


def main() -> None:
    print("=== Crear Super Admin de AgendixPOS ===")
    data = ask_super_admin_data()
    if data is None:
        raise SystemExit(1)
    asyncio.run(create_super_admin(data))


if __name__ == "__main__":
    main()
