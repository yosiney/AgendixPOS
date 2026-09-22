# AgendixPOS

Sistema POS (Point of Sale) multiempresa basado en tenants. Primer enfoque: repuestos
y accesorios para motos y bicicletas, con una base genérica para otros tipos de comercio.

- **Backend:** Python, FastAPI, MongoDB, Docker (`backend/`)
- **Frontend:** React, TypeScript, Vite, Tailwind CSS (`frontend/`)

## Estructura

```text
AgendixPOS/
├── backend/
│   ├── docker-compose.yml      # Entorno de desarrollo
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .env.example            # Plantilla de variables de entorno (sin credenciales)
│   └── app/
│       ├── main.py             # Crea la app, conexión a MongoDB, CORS
│       ├── api/                # Router principal (/api/v1) y health check
│       ├── core/               # config, database, security, roles, permissions, exceptions
│       ├── shared/             # Repositorio base (aislamiento por tenant) y esquemas comunes
│       ├── modules/            # Un módulo por funcionalidad
│       │   ├── auth/
│       │   ├── tenants/
│       │   └── users/
│       └── scripts/            # Comandos de administración
└── frontend/
    ├── .env.example            # VITE_API_URL
    └── src/
        ├── App.tsx             # Rutas
        ├── lib/                # Cliente HTTP, token, roles, permisos, formatos
        ├── components/         # Componentes de interfaz reutilizables
        ├── hooks/
        ├── layouts/            # Menú lateral y cabecera
        └── modules/            # Mismos módulos que el backend
            ├── auth/
            ├── tenants/
            └── users/
```

Cada módulo del backend contiene:

| Archivo           | Responsabilidad                                  |
|-------------------|--------------------------------------------------|
| `router.py`       | Endpoints HTTP                                   |
| `schemas.py`      | Modelos Pydantic de entrada y salida             |
| `service.py`      | Lógica de negocio                                |
| `repository.py`   | Acceso a MongoDB                                 |

## Puesta en marcha del backend

Todos los comandos se ejecutan desde la carpeta `backend/`.

1. Configurar las variables de entorno:

   ```bash
   cd backend
   cp .env.example .env
   ```

   Completar `MONGODB_URL`, `MONGODB_DATABASE` y `JWT_SECRET_KEY` en `.env`.

2. Levantar el backend:

   ```bash
   docker compose up --build
   ```

3. Crear el primer Super Admin (con el contenedor levantado, en otra terminal):

   ```bash
   docker compose exec backend python -m app.scripts.create_super_admin
   ```

   En Git Bash para Windows puede ser necesario anteponer `winpty` (en PowerShell no).

4. Abrir la documentación interactiva: <http://localhost:8000/docs>

   Con el botón **Authorize** se inicia sesión: en `username` va el **email**.

## Puesta en marcha del frontend

Requiere Node.js. Los comandos se ejecutan desde la carpeta `frontend/`, con el backend levantado.

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Web en <http://localhost:5173>. La URL del backend sale de `VITE_API_URL` y el backend
debe incluir `http://localhost:5173` en `CORS_ORIGINS`.

## Roles

| Rol           | Nivel       | Acceso                                                  |
|---------------|-------------|---------------------------------------------------------|
| `super_admin` | Plataforma  | Administra empresas (tenants). Sin acceso a datos de empresa. |
| `admin`       | Empresa     | Administra su empresa (usuarios, y luego productos, ventas…). |
| `employee`    | Empresa     | Operaciones del POS según los permisos asignados.       |

Los permisos de cada rol se definen en `backend/app/core/permissions.py`.

## Endpoints iniciales

| Método | Ruta                         | Acceso           |
|--------|------------------------------|------------------|
| GET    | `/api/v1/health`             | Público          |
| POST   | `/api/v1/auth/login`         | Público          |
| GET    | `/api/v1/auth/me`            | Autenticado      |
| POST   | `/api/v1/tenants`            | Super Admin      |
| GET    | `/api/v1/tenants`            | Super Admin      |
| GET    | `/api/v1/tenants/{id}`       | Super Admin      |
| PATCH  | `/api/v1/tenants/{id}`       | Super Admin      |
| GET    | `/api/v1/users`              | Admin            |
| POST   | `/api/v1/users`              | Admin            |
| GET    | `/api/v1/users/{id}`         | Admin            |
| PATCH  | `/api/v1/users/{id}`         | Admin            |

## Aislamiento entre empresas

- Todo documento que pertenece a una empresa guarda su `tenant_id`.
- El `tenant_id` se obtiene siempre del usuario autenticado, nunca del body ni de la URL.
- Los repositorios de datos de empresa heredan de `TenantScopedRepository`
  (`backend/app/shared/repository.py`), que agrega el `tenant_id` a todas las
  consultas y escrituras.

## Cómo agregar un nuevo módulo

**Backend**

1. Crear `backend/app/modules/<modulo>/` con `router.py`, `schemas.py`, `service.py` y `repository.py`.
2. Si sus datos pertenecen a una empresa, el repositorio debe heredar de `TenantScopedRepository`.
3. Agregar los permisos en `core/permissions.py` y asignarlos a los roles.
4. Registrar el router en `app/api/router.py`.
5. Si necesita índices, crearlos en `create_indexes()` de `app/main.py`.

**Frontend**

1. Crear `frontend/src/modules/<modulo>/` con `types.ts`, `api.ts` y sus páginas.
2. Agregar los permisos nuevos en `src/lib/permissions.ts`.
3. Registrar la ruta en `src/App.tsx`, protegida con `ProtectedRoute` y su permiso.
4. Agregar la opción del menú en `NAV_ITEMS` de `src/layouts/AppLayout.tsx`.
