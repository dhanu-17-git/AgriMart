<p align="center">
  <img src="image/AgriMart Digital Marketplace Logo.png" alt="AgriMart" width="140" />
</p>

<h1 align="center">AgriMart</h1>

<p align="center">
  <strong>Agricultural commerce platform unifying input supply, APMC commodity exchange, and on-device crop intelligence into one system.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/react-19-61DAFB?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/django-5-092E20?logo=django&logoColor=white" />
  <img src="https://img.shields.io/badge/fastapi-0.116-009688?logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/tailwindcss-4-06B6D4?logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/vite-8-646CFF?logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/tests-35_passing-brightgreen" />
</p>

---

## Modules

| Module | Route Prefix | What It Does |
|--------|-------------|--------------|
| **AG Store & Rentals** | `/store-rental/*` | Agricultural input e-commerce and tractor rental booking with cart, orders, and equipment scheduling. |
| **AG Market & Mandi** | `/market-mandi/*` | APMC commodity exchange with live ticker, escrow payment gateway, and an agentic AI copilot powered by 11 deterministic market tools. |
| **AG Crop Intelligence** | `/crop-intelligence/*` | On-device leaf disease detection (Qwen2.5-VL:7B via Ollama), ICAR crop recommendation engine, and Soil Health Card OCR with human verification. |

Each module runs as a **route-isolated React shell** with cross-domain redirect protection — no state bleed between domains.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  React 19 + Vite 8 + Tailwind CSS 4                            │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │ AG Store     │  │ AG Market    │  │ AG Crop Intelligence  │  │
│  │ & Rentals    │  │ & Mandi      │  │                       │  │
│  └──────┬───────┘  └──────┬───────┘  └───────────┬───────────┘  │
└─────────┼─────────────────┼──────────────────────┼──────────────┘
          │                 │                      │
          ▼                 ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  Django 5 + DRF          │  FastAPI (Realtime)                  │
│  :8000                   │  :8001                               │
│                          │                                      │
│  ├── store/              │  WebSocket price feed                │
│  ├── rentals/            │                                      │
│  ├── mandi/              │                                      │
│  ├── transactions/       │                                      │
│  ├── ai/                 │                                      │
│  │   ├── agents/         │  Agentic Coordinator + Guardrails    │
│  │   ├── tools/          │  11 Market Tools (read-only)         │
│  │   ├── ml/             │  Disease Detector (Ollama)           │
│  │   ├── forecasting/    │  Price Predictor                     │
│  │   └── llm/            │  OpenRouter Adapter                  │
│  ├── users/              │                                      │
│  ├── bookings/           │                                      │
│  └── conversations/      │                                      │
├──────────────────────────┴──────────────────────────────────────┤
│  PostgreSQL (pgvector)  │  Redis  │  Celery (5 queues)          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Engineering

**Market AI Copilot** — Agentic tool-calling architecture with 2-tier domain guardrails. The coordinator dispatches across 11 deterministic tools (price lookup, mandi comparison, profit calculation, escrow management, delivery booking, buyer matching, liquidity analysis, price forecasting, sell/buy timing). Off-domain queries are rejected before reaching the LLM.

**Escrow Settlement** — 6-stage lifecycle state machine (`contract_issued` → `escrow_funded` → `goods_dispatched` → `assay_passed` → `buyer_accepted` → `funds_released`). Each transition is actor-validated and produces a SHA-256 chained verification hash stored as a `TransactionLifecycleEvent`.

**Disease Detection** — 9-class ICAR disease catalog covering Tomato, Rice, Wheat, Potato, Maize, and Cotton pathologies. Qwen2.5-VL:7B runs locally via Ollama for leaf image assessment. Confidence gating rejects uncertain classifications. Each diagnosis returns prescribed chemical control, organic alternatives, and cultural practices from the taxonomy.

**SHC OCR** — Dual-path Soil Health Card parsing: vision model extraction + regex normalization, with a human verification step before data is committed.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8, Tailwind CSS 4, React Router 7, Lucide Icons |
| Backend API | Django 5, Django REST Framework, FastAPI |
| AI / ML | OpenRouter (GPT-4o-mini), Ollama (Qwen2.5-VL:7B), scikit-learn |
| Database | PostgreSQL 16 (pgvector), SQLite (dev) |
| Auth | JWT + Argon2, phone-based login |
| Task Queue | Celery 5 + Redis 7 (5 named queues) |
| Security | Redis sliding-window rate limiting, SHA-256 escrow hashing, encrypted PII fields |
| Infra | Docker Compose (6 services), uv package manager |

---

## Quick Start

### Prerequisites

- Python 3.12+, Node 20+, Redis, PostgreSQL (or use Docker Compose)
- [Ollama](https://ollama.com) with `qwen2.5vl:7b` pulled (for Crop Intelligence)
- An [OpenRouter](https://openrouter.ai) API key (for Market Copilot)

### Docker (recommended)

```bash
git clone https://github.com/dhanu-17-git/MINOR-PROJECT-.git
cd MINOR-PROJECT-

# Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env — add OPENROUTER_API_KEY and OLLAMA_VISION_MODEL

docker compose up -d
```

Django API at `localhost:8000`, FastAPI realtime at `localhost:8001`.

### Manual

```bash
# Backend
cd backend
uv sync            # or: pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

Frontend dev server at `localhost:5173`.

---

## Testing

```bash
cd backend
pytest -v
```

35 tests across 6 modules: agentic system, API endpoints, crop intelligence, realtime schemas, security utilities, upload validation.

---

## Project Structure

```
├── frontend/
│   ├── src/
│   │   ├── apps/crop-intelligence/   # Crop Intelligence module
│   │   ├── pages/                     # Store, Market, Landing shells
│   │   ├── components/                # Shared UI components
│   │   ├── assistant/                 # AI Copilot chat + tool cards
│   │   ├── router/                    # Route-isolated AppRouter
│   │   └── services/                  # API client layer
│   └── public/images/                 # Product & crop imagery
│
├── backend/
│   ├── ai/                            # AI engine
│   │   ├── agents/                    # Coordinator + guardrails
│   │   ├── tools/                     # 11 market tool definitions
│   │   ├── ml/disease_detector/       # Ollama vision + 9-class taxonomy
│   │   ├── forecasting/               # Statistical price predictor
│   │   └── llm/                       # OpenRouter adapter
│   ├── mandi/                         # APMC models, tickers, services
│   ├── store/                         # Product catalog & cart
│   ├── rentals/                       # Equipment rental system
│   ├── transactions/                  # Escrow lifecycle + settlement
│   ├── users/                         # Auth, JWT, Argon2
│   ├── bookings/                      # Delivery slot management
│   ├── analytics/                     # Buyer matching, liquidity, profit
│   ├── realtime/                      # FastAPI WebSocket feed
│   └── common/                        # Middleware, security, idempotency
│
└── docker-compose.yml                 # 6-service orchestration
```

---

## Screenshots

<p align="center">
  <img src="image/AgriMart Suite_ Store, Market & Crop.png" alt="AgriMart Suite" width="720" />
</p>

<p align="center">
  <img src="image/AgriMart AG Store Login Experience.png" alt="AG Store" width="360" />
  <img src="image/AgriMart APMC Market Login.png" alt="AG Market" width="360" />
</p>

<p align="center">
  <img src="image/AgriMart AG Crop Intelligence Login.png" alt="AG Crop Intelligence" width="360" />
</p>

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENROUTER_API_KEY` | Server-side API key for Market Copilot LLM |
| `OPENROUTER_MODEL` | Model identifier (e.g. `openai/gpt-4o-mini`) |
| `OLLAMA_BASE_URL` | Ollama server endpoint (default `http://localhost:11434`) |
| `OLLAMA_VISION_MODEL` | Vision model tag (e.g. `qwen2.5vl:7b`) |
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `FIELD_ENCRYPTION_KEYS` | PII field encryption key |

See [`backend/.env.example`](backend/.env.example) for the full list.

---

## API Surface

| Endpoint Group | Prefix | Description |
|---------------|--------|-------------|
| Store | `/api/store/` | Product catalog, cart, orders |
| Rentals | `/api/rentals/` | Equipment listings, availability |
| Mandi | `/api/mandi/` | Commodities, APMC tickers, auctions |
| Transactions | `/api/transactions/` | Escrow lifecycle, settlement |
| AI | `/api/ai/` | Copilot chat, disease detection, crop recommendation, SHC OCR |
| Users | `/api/users/` | Auth, registration, profile |
| Bookings | `/api/bookings/` | Delivery slot reservation |
| Conversations | `/api/conversations/` | Chat history persistence |

---

## Disease Detection Catalog

| Crop | Disease | Pathogen | Severity |
|------|---------|----------|----------|
| Tomato | Early Blight | *Alternaria solani* | Moderate |
| Tomato | Late Blight | *Phytophthora infestans* | High |
| Rice | Brown Spot | *Bipolaris oryzae* | Moderate |
| Rice | Leaf Blast | *Magnaporthe oryzae* | High |
| Wheat | Yellow Rust | *Puccinia striiformis* | High |
| Potato | Early Blight | *Alternaria solani* | Moderate |
| Potato | Late Blight | *Phytophthora infestans* | High |
| Maize | Turcicum Leaf Blight | *Exserohilum turcicum* | Moderate |
| Cotton | Bacterial Blight | *Xanthomonas citri pv. malvacearum* | Moderate |

---

## Team

Built at **NIE Mysuru** — B.E. CSE (AI & ML), 2026-27 Minor Project.

| Name | USN |
|------|-----|
| Darshan V | 4NI24CI035 |
| Dhanush M | 4NI24CI038 |
| Gandham Raja Reddy | 4NI24CI044 |
| Harsha D K | 4NI24CI048 |

**Guide:** Divyashree R, Dept. of CSE (AI & ML), NIE Mysuru.

---

## License

Academic project. Not licensed for commercial distribution.
