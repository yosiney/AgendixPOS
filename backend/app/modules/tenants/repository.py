"""Acceso a datos de la colección `tenants` (colección global de la plataforma)."""

from app.shared.repository import BaseRepository


class TenantRepository(BaseRepository):
    collection_name = "tenants"
