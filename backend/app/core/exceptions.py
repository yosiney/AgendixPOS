"""Errores de la aplicación y su conversión a respuestas HTTP.

Los servicios lanzan estos errores y no necesitan conocer detalles de HTTP.
Todas las respuestas de error tienen el formato: {"detail": "mensaje"}.
"""

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from pymongo.errors import DuplicateKeyError


class AppError(Exception):
    status_code = status.HTTP_400_BAD_REQUEST
    default_message = "Solicitud inválida."

    def __init__(self, message: str | None = None) -> None:
        self.message = message or self.default_message
        super().__init__(self.message)


class BadRequestError(AppError):
    pass


class AuthenticationError(AppError):
    status_code = status.HTTP_401_UNAUTHORIZED
    default_message = "No autenticado."


class PermissionDeniedError(AppError):
    status_code = status.HTTP_403_FORBIDDEN
    default_message = "No tienes permisos para realizar esta acción."


class NotFoundError(AppError):
    status_code = status.HTTP_404_NOT_FOUND
    default_message = "Recurso no encontrado."


class ConflictError(AppError):
    status_code = status.HTTP_409_CONFLICT
    default_message = "El recurso ya existe."


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def handle_app_error(request: Request, error: AppError) -> JSONResponse:
        headers = {"WWW-Authenticate": "Bearer"} if isinstance(error, AuthenticationError) else None
        return JSONResponse(
            status_code=error.status_code,
            content={"detail": error.message},
            headers=headers,
        )

    @app.exception_handler(DuplicateKeyError)
    async def handle_duplicate_key(request: Request, error: DuplicateKeyError) -> JSONResponse:
        # Respaldo para índices únicos no controlados explícitamente en un servicio.
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={"detail": ConflictError.default_message},
        )
