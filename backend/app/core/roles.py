"""Roles de usuario."""

from enum import StrEnum


class Role(StrEnum):
    SUPER_ADMIN = "super_admin"  # Administrador global de la plataforma (sin tenant).
    ADMIN = "admin"  # Administrador de una empresa (tenant).
    EMPLOYEE = "employee"  # Usuario operativo de una empresa (tenant).


class TenantRole(StrEnum):
    """Roles que se pueden asignar a los usuarios de una empresa."""

    ADMIN = Role.ADMIN.value
    EMPLOYEE = Role.EMPLOYEE.value
