# Single-image build for Railway/Render: build the React frontend, then serve
# it from the FastAPI backend so the whole app runs as ONE web service.
# (Local dev still uses docker-compose with separate backend/frontend images.)

# ---- Stage 1: build the React frontend ----
FROM node:20-alpine AS fe
WORKDIR /fe
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ---- Stage 2: FastAPI backend that also serves the built frontend ----
FROM python:3.11-slim
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1
WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/app ./app
# Copy the built SPA (from stage 1); FastAPI serves it at "/"
COPY --from=fe /fe/dist ./static

EXPOSE 8000
# Bind to the platform-provided $PORT (Railway/Render); default 8000 locally.
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
