# 🌍 Travel Itinerary Planner with Local Insights

An AI travel planner where a user enters a **destination + budget + interests**, and an
LLM builds a **day-by-day itinerary** using **prompt chaining**:

```
destination research  →  itinerary generation  →  budget check
   (local insights)        (day-by-day plan)      (fits the budget?)
```

Users **sign up / log in** (accounts stored in **MySQL**), then generate trips that are
saved to the database — where they can **open, edit, save, and delete** them.

---

## 🧱 Tech stack

| Layer        | Technology                                             |
|--------------|--------------------------------------------------------|
| LLM API      | **Groq** (`llama-3.3-70b-versatile`) with JSON mode    |
| Prompt Eng.  | Role prompts, strict JSON schemas, 3-step chaining     |
| Backend      | **Python + FastAPI + SQLAlchemy**                      |
| Auth         | **Email/password** login (PBKDF2 hashing + signed token, stdlib) |
| Database     | **MySQL 8** (users + trips)                            |
| Frontend     | **React (Vite) + HTML/CSS/JS**                         |
| Deployment   | **Docker + docker-compose** (MySQL + backend + nginx)  |

---

## 📁 Project structure

```
.
├── docker-compose.yml         # db + backend + frontend
├── .env.example               # GROQ_API_KEY for compose
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .env.example
│   └── app/
│       ├── main.py            # FastAPI app + startup/DB init
│       ├── config.py          # env-based settings
│       ├── database.py        # SQLAlchemy engine/session
│       ├── models.py          # User + Trip ORM models
│       ├── schemas.py         # Pydantic request/response models
│       ├── prompts.py         # prompt-engineering templates (3 steps)
│       ├── llm.py             # Groq client + prompt chain
│       ├── auth.py            # password hashing + signed tokens (stdlib)
│       └── routers/
│           ├── auth.py        # signup / login / me
│           └── trips.py       # generate / list / get / edit / delete
└── frontend/
    ├── Dockerfile             # multi-stage: vite build -> nginx
    ├── nginx.conf             # serves SPA + proxies /api -> backend
    └── src/
        ├── App.jsx            # auth gate + view routing
        ├── api.js
        ├── auth.js            # login/signup client + token storage
        └── components/        # AuthPage, Nav, TripForm, ItineraryView,
                               # LocalInsights, BudgetPanel, PackingTips,
                               # SavedTrips, EmptyState
```

---

## 🚀 Quick start with Docker (recommended)

> Requires **Docker Desktop running**.

1. Get a free Groq API key: https://console.groq.com/keys
2. Create the env file at the project root:

   ```bash
   cp .env.example .env
   # edit .env and set GROQ_API_KEY=...
   ```

3. Build and run everything:

   ```bash
   docker compose up --build
   ```

4. Open the app:

   - Frontend: **http://localhost:8080**
   - Backend API docs: **http://localhost:8000/docs**
   - Health check: **http://localhost:8000/api/health**

5. You'll land on a **login page** — click **Create an account**, sign up with any
   email + password, and you're in. Then plan a trip in the **AI Designer**.

The backend waits for MySQL to become healthy, then auto-creates the `users` and
`trips` tables.

> **Note:** subsequent runs need only `docker compose up -d` (no `--build`).

To stop: `docker compose down` (add `-v` to also wipe the database volume).

---

## 🛠️ Local development (without Docker)

You need **Python 3.11+**, **Node 18+**, and a **MySQL** instance.

### Backend

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate   |   macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env         # set GROQ_API_KEY + DB_* values
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev                  # http://localhost:5173 (proxies /api -> :8000)
```

---

## 🔌 API reference

| Method | Endpoint                  | Description                                  |
|--------|---------------------------|----------------------------------------------|
| GET    | `/api/health`             | Health + active model                        |
| POST   | `/api/trips/generate`     | Run the prompt chain and save a new trip     |
| GET    | `/api/trips`              | List saved trips (summaries)                 |
| GET    | `/api/trips/{id}`         | Get one full trip                            |
| PUT    | `/api/trips/{id}`         | Edit/save (title, itinerary, notes, …)       |
| DELETE | `/api/trips/{id}`         | Delete a trip                                |

**Generate request body:**

```json
{
  "destination": "Kyoto, Japan",
  "budget": 1200,
  "currency": "USD",
  "num_days": 3,
  "interests": ["Food", "History", "Local Culture"]
}
```

---

## 🧠 Prompt engineering & chaining

Each step (in `backend/app/prompts.py`) applies deliberate techniques:

1. **Role assignment** — each step gets an expert persona (researcher → itinerary
   designer → budget analyst).
2. **Strict JSON contracts** — every prompt specifies an exact output schema and
   forbids prose/markdown; Groq **JSON mode** enforces valid JSON.
3. **Grounding via chaining** — step 2 receives step 1's *research JSON*, and step 3
   receives step 2's *itinerary JSON*, so later steps reason over real facts instead
   of hallucinating.
4. **Guardrails** — "don't invent prices", "omit if unsure" reduce hallucination.

Robustness: `llm._extract_json()` still recovers valid JSON even if the model wraps
it in ```` ```json ```` fences or stray text.

---

## ✅ Requirements checklist

- [x] **Individual project** — Travel Itinerary Planner with Local Insights
- [x] **Programming language of choice** — Python + JavaScript
- [x] **Prompt Engineering** — role prompts, JSON schemas, 3-step chain, guardrails
- [x] **LLM API** — Groq (Llama 3.3 70B)
- [x] **Database** — MySQL (stores/edits/saves trips)
- [x] **Web framework** — FastAPI (backend) + React (frontend)
- [x] **Frontend in HTML/CSS/JS** — React + CSS
- [x] **Deployment** — Docker + docker-compose

---

## 🧪 Testing

An end-to-end backend test (`backend/_verify_api.py`) runs the full API against an
in-memory SQLite DB with a mocked LLM — no key or network required:

```bash
cd backend
./.venv/Scripts/python.exe _verify_api.py   # Windows
# python _verify_api.py                     # macOS/Linux
```
