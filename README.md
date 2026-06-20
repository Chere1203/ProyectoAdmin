# 🎴 Álbum Virtual FIFA — FutbolCard CR

Plataforma digital de coleccionismo de figuritas del Mundial FIFA.  
Proyecto académico — Administración de Proyectos G51, I Semestre 2026.  
Instituto Tecnológico de Costa Rica · Campus San Carlos.

**Equipo:** Erick · Juanpa · Andrés  
**Profesor:** Marvin Campos

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Base de datos | Supabase (PostgreSQL) |
| CI/CD | GitHub Actions |
| Contenedores | Docker |
| Gestión | Jira + GitHub |

---

## Estructura del Proyecto

```
albumvirtual/
├── backend/          # API REST con Node.js + Express
│   ├── src/
│   │   ├── config/       # Configuración de Supabase y env
│   │   ├── controllers/  # Lógica de negocio
│   │   ├── middleware/    # Auth, validación, errores
│   │   ├── models/        # Modelos y queries a Supabase
│   │   └── routes/        # Definición de rutas
│   └── tests/             # Pruebas unitarias (Jest)
├── frontend/         # App React + Vite
│   ├── src/
│   │   ├── components/    # Componentes reutilizables
│   │   ├── pages/         # Páginas de la app
│   │   ├── hooks/         # Custom hooks
│   │   └── services/      # Llamadas a la API
│   └── public/
├── .github/
│   └── workflows/     # Pipelines CI/CD
├── docker-compose.yml
└── README.md
```

---

## Convención de Commits

```
tipo(ALBUM-XX): descripción corta

Ejemplos:
feat(ALBUM-10): implementa registro de usuario
fix(ALBUM-15): corrige validación de figuritas repetidas
test(ALBUM-22): agrega pruebas al módulo de intercambio
docs(ALBUM-05): actualiza README
chore(ALBUM-01): configura pipeline CI inicial
```

---

## Cómo levantar el proyecto localmente

### Requisitos
- Node.js 20+
- Docker (opcional)
- Cuenta en [Supabase](https://supabase.com)

### Backend
```bash
cd backend
cp .env.example .env      # Completar con credenciales de Supabase
npm install
npm run dev               # Levanta en http://localhost:3001
```

### Frontend
```bash
cd frontend
cp .env.example .env      # Completar con URL del backend
npm install
npm run dev               # Levanta en http://localhost:5173
```

### Con Docker Compose
```bash
docker-compose up --build
```

---

## CI/CD

El pipeline de GitHub Actions se ejecuta automáticamente en cada `push` y `pull_request` hacia `main` o `develop`.

**Etapas del pipeline:**
1. Lint del código
2. Pruebas unitarias (Jest)
3. Build de la aplicación
4. Deploy automático a staging (en merges a `develop`)

Estado del pipeline: [![CI](../../actions/workflows/ci.yml/badge.svg)](../../actions/workflows/ci.yml)

---

## Despliegue (guía rápida)

Front-end (estático):
- Este repo contiene el sitio de `frontend` construido con Vite. He añadido un workflow de GitHub Actions que construye `frontend` y despliega `frontend/dist` a GitHub Pages automáticamente al hacer push a `main`.
- URL resultante: habilita GitHub Pages en la sección _Settings → Pages_ si es necesario. Tras el primer merge a `main`, Pages servirá desde la rama `gh-pages` creada por el workflow.

Back-end (imagen Docker):
- He añadido un workflow que construye la imagen Docker del `backend` y la publica en GitHub Container Registry (GHCR) como `ghcr.io/<owner>/proyectoadmin-backend:latest`.
- Para exponer el backend, despliega la imagen en un servicio como Render, Railway o Fly.io. Ejemplo rápido con Render:

	1. En Render crea un nuevo "Web Service" y selecciona "Docker".
	2. En "Image" pon `ghcr.io/<tu-usuario>/proyectoadmin-backend:latest` y concede permisos o crea un deploy automático desde GHCR.
	3. Configura las variables de entorno (`SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `JWT_SECRET`, etc.) en el panel del servicio.

Alternativa: el `backend` también incluye `Dockerfile` y puede desplegarse desde cualquier proveedor que acepte imágenes Docker.

Secrets y permisos:
- El workflow de publicar la imagen usa `GITHUB_TOKEN` para autenticarse en GHCR; si tu organización restringe permisos, crea un personal access token con `read:packages, write:packages` y añádelo como `GHCR_PAT` en `Settings → Secrets → Actions`.

Si quieres, configuro también el workflow para desplegar automáticamente el `backend` a Render/Heroku si me das acceso al API key (lo puedo dejar preparado y tú añades el secreto en GitHub).

## Sprints

| Sprint | Objetivo | Fechas |
|---|---|---|
| Sprint 1 | Configuración base + investigación CI/CD | 1–7 Jun 2026 |
| Sprint 2 | Auth de usuarios + gestión del álbum | 8–14 Jun 2026 |
| Sprint 3 | Módulo de intercambio | 15–19 Jun 2026 |
| Sprint 4 | Contenido digital + integración Jira | 20–22 Jun 2026 |
| Sprint 5 | MVP estable + demo + entrega final | 23–25 Jun 2026 |
