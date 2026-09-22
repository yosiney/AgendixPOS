FROM python:3.14-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Dependencias primero para aprovechar la caché de Docker.
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY app ./app

# Ejecutar sin privilegios de root.
RUN useradd --create-home --uid 1000 appuser
USER appuser

EXPOSE 8000

# Comando de producción. En desarrollo, docker-compose.yml lo reemplaza para usar --reload.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
