"""Endpoint de estado del servicio."""

from fastapi import APIRouter, Response, status
from pymongo.errors import PyMongoError

from app.core.database import DatabaseDep

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check(database: DatabaseDep, response: Response) -> dict[str, str]:
    try:
        await database.command("ping")
    except PyMongoError:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {"status": "error", "database": "unavailable"}
    return {"status": "ok", "database": "ok"}
