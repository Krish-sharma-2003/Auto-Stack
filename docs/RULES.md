# Development Rules

## Setup

```bash
cd backend && python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python3 -m uvicorn main:app --reload --port 8002

# new terminal
cd frontend/project && npm install && npm run dev  # :5173
```

Set `GEMINI_API_KEY`, `SUPABASE_URL`, and `SUPABASE_KEY` in `backend/.env`. The frontend uses `VITE_API_BASE` or `http://127.0.0.1:8002`.

## Dependencies

- Backend: `fastapi`, `uvicorn`, `python-multipart`, `google-generativeai`, `supabase`, `python-dotenv`, `Pillow`, `httpx`, `pydantic`.
- Frontend: `react`, `react-router-dom`, `vite`, `tailwindcss`, `framer-motion`, `lucide-react`, Radix/shadcn primitives, `recharts`.

```bash
pip install fastapi uvicorn python-multipart google-generativeai supabase python-dotenv Pillow httpx pydantic
npm install react react-router-dom framer-motion lucide-react tailwindcss vite
```

Use `pip install <package> --break-system-packages` only for an intentional system-Python install; it is unnecessary inside this project venv.

## Conventions and guardrails

- Backend: `APIRouter(prefix="/api/...")`, Pydantic inputs, shared `core.supabase_client`.
- Normalize product names before inventory matching; preserve per-item `UPDATED`/`CREATED`/`SOLD`/`SKIPPED`/`ERROR` partial-success responses.
- Frontend API calls must import `API_BASE` from `@/lib/api`; use Tailwind and `cn()` for conditional classes.
- Do not change working purchase, sale, challan, vendor-sync, or movement flows without explicit approval. Show plan/diff before risky changes; commit before risky work.
- Never commit `.env`, keys, `venv/`, `node_modules/`, build output, or Python cache. Existing `.gitignore` covers these paths.

