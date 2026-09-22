"""Seguridad: hash de contraseñas (Argon2) y tokens de acceso (JWT)."""

import secrets
from datetime import UTC, datetime, timedelta
from typing import Any

import jwt
from pwdlib import PasswordHash
from starlette.concurrency import run_in_threadpool

from app.core.config import settings
from app.core.exceptions import AuthenticationError

JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_TYPE = "access"

_password_hasher = PasswordHash.recommended()  # Argon2

# Hash de un valor aleatorio. Se usa en el login cuando el email no existe, para
# que la respuesta tarde lo mismo que con un email válido y no se pueda deducir
# qué emails están registrados.
DUMMY_PASSWORD_HASH = _password_hasher.hash(secrets.token_urlsafe(32))


async def hash_password(password: str) -> str:
    # Argon2 es costoso a propósito: se ejecuta en otro hilo para no bloquear el servidor.
    return await run_in_threadpool(_password_hasher.hash, password)


async def verify_password(password: str, password_hash: str) -> bool:
    return await run_in_threadpool(_password_hasher.verify, password, password_hash)


def create_access_token(*, user_id: str, role: str, tenant_id: str | None) -> str:
    now = datetime.now(UTC)
    payload: dict[str, Any] = {
        "sub": user_id,
        "role": role,
        "tenant_id": tenant_id,
        "type": ACCESS_TOKEN_TYPE,
        "iat": now,
        "exp": now + timedelta(minutes=settings.access_token_expire_minutes),
    }
    return jwt.encode(payload, settings.jwt_secret_key.get_secret_value(), algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> dict[str, Any]:
    """Valida la firma y la expiración del token. Lanza AuthenticationError si no es válido."""
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key.get_secret_value(),
            algorithms=[JWT_ALGORITHM],
            options={"require": ["sub", "exp", "iat"]},
        )
    except jwt.ExpiredSignatureError as error:
        raise AuthenticationError("La sesión ha expirado. Inicia sesión nuevamente.") from error
    except jwt.InvalidTokenError as error:
        raise AuthenticationError("Token de acceso inválido.") from error

    if payload.get("type") != ACCESS_TOKEN_TYPE:
        raise AuthenticationError("Token de acceso inválido.")
    return payload
