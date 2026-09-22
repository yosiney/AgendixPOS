"""Permisos y su asignación a cada rol.

Los endpoints verifican permisos (no roles). Para dar acceso a una nueva
funcionalidad basta con crear el permiso y asignarlo a los roles que corresponda.
"""

from enum import StrEnum

from app.core.roles import Role


class Permission(StrEnum):
    # Nivel plataforma (Super Admin)
    TENANTS_MANAGE = "tenants:manage"

    # Nivel empresa (tenant)
    USERS_READ = "users:read"
    USERS_MANAGE = "users:manage"


ROLE_PERMISSIONS: dict[Role, frozenset[Permission]] = {
    Role.SUPER_ADMIN: frozenset({
        Permission.TENANTS_MANAGE,
    }),
    Role.ADMIN: frozenset({
        Permission.USERS_READ,
        Permission.USERS_MANAGE,
    }),
    # Los permisos del empleado (ventas, consulta de productos, inventario...)
    # se agregarán junto con esos módulos.
    Role.EMPLOYEE: frozenset(),
}


def get_role_permissions(role: Role) -> frozenset[Permission]:
    return ROLE_PERMISSIONS.get(role, frozenset())
