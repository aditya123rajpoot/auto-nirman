# Auto Nirman FastAPI Backend

FastAPI service layer for Auto Nirman construction intelligence.

## Run Locally

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

Health check:

```bash
curl http://localhost:8000/health
```

## API Prefix

All production endpoints live under:

```text
/api/v1
```

Initial endpoints:

- `GET /health`
- `POST /api/v1/estimate`
- `POST /api/v1/chat`
- `POST /api/v1/map2d/ai-plan`
- `POST /api/v1/map2d/detect-boundary`
- `GET /api/v1/tour/tiers`
- `POST /api/v1/tour/cost`

## Current Migration Strategy

The Next.js API routes remain active for now, so the frontend does not break. This backend is the new service foundation. Once validated, the frontend can call FastAPI directly or Next.js can proxy to FastAPI during migration.

