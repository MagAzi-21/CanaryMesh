# AGENTS.md — CanaryMesh Autonomous Build Guide

## Project Context
**CanaryMesh** is a lightweight, self-contained **Deception-Based Intrusion Detection & Active Defense System** built for the INSA Cyber Talent Summer Camp 2026 (Cybersecurity Stream) final evaluation.
- **Author:** Mikiyas Abesha Aba (`CTC-5608-26`)
- **Constraint:** Must be 100% original, deterministic, runnable locally in < 2 minutes, and showcase high visual impact for a 5-minute video demo. No vulnerability scanners.

## Tech Stack (Strict — Do Not Deviate)
- **Backend:** Python 3.10+, FastAPI, Uvicorn, SQLite (`sqlite3` standard library or SQLModel), `httpx` (for async Telegram webhooks).
- **Frontend UI/UX (STRICT):** Next.js (App Router), TypeScript, Tailwind CSS, Lucide Icons, and **exclusively `shadcn/ui` (`https://ui.shadcn.com/`) components** for every single UI element.
  - **DO NOT** write custom raw HTML buttons, raw `<input>`/`<select>` tags, custom modals, or custom tables from scratch.
  - **MUST** initialize and install official `shadcn/ui` primitives (`npx shadcn@latest init -t next -y` and `npx shadcn@latest add button card badge table dialog sheet input label select tabs alert sonner separator scroll-area -y`).
  - **Design Aesthetic:** Clean, sharp dark-mode SOC aesthetic (`zinc-950` background, `zinc-900` cards, `1px` `zinc-800` borders, crisp monospace `JetBrains Mono` / `Geist Mono` for IPs, tokens, and HTTP payloads—zero generic AI-slop gradients).

## STRICT ZERO-EMOJI & ICONOGRAPHY POLICY
- **NEVER** use Unicode emojis anywhere in the codebase (frontend TSX/JSX, backend Python strings, Telegram templates, CLI scripts, logs, toasts, or documentation). No 🔴, 🟠, 🟡, 🛡️, 👁️, 🚨, ✅, ❌, etc.
- **Frontend Icons:** Use `lucide-react` vector icons exclusively (`ShieldAlert`, `ShieldCheck`, `Terminal`, `Radio`, `Lock`, `Unlock`, `Eye`, `Copy`, `Check`, `Plus`, `Activity`, `AlertTriangle`), paired strictly with official `shadcn/ui` (`https://ui.shadcn.com/`) components.
- **Backend / Telegram / CLI Status Markers:** Use crisp bracketed SOC tags (`[CRITICAL]`, `[HIGH]`, `[MEDIUM]`, `[ACTIVE_QUARANTINE]`, `[MONITORED]`, `[ALERT]`, `[OK]`, `[BLOCKED]`) instead of emojis.
- **Simulation:** Standalone Python script (`simulate_attack.py`) using `httpx` / `requests` to trigger realistic intrusion scenarios on demand with bracketed tags and ANSI colors only.

## Directory Structure
```text
canarymesh/
├── AGENTS.md               # Agent execution rules
├── PRD.md                  # Product requirements & feature specs
├── ARCHITECTURE.md         # System design & database schema
├── README.md               # Public GitHub documentation & portal text
├── backend/
│   ├── requirements.txt    # fastapi, uvicorn, httpx, pydantic, python-dotenv
│   ├── .env.example        # TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, AUTO_BAN_THRESHOLD
│   └── app/
│       ├── __init__.py
│       ├── main.py         # FastAPI app, CORS, IP quarantine middleware, routes
│       ├── database.py     # SQLite connection, table initialization, CRUD helpers
│       ├── models.py       # Pydantic schemas for tokens, incidents, quarantine
│       ├── deception.py    # Honey-token generator (.env, API keys, decoy routes)
│       ├── forensics.py    # Request fingerprinting, payload analyzer (SQLi/XSS/Traversal)
│       └── alerter.py      # Async Telegram SOC alert dispatcher
├── frontend/               # Next.js + Tailwind + shadcn/ui SOC Command Center
│   ├── components.json     # Official shadcn/ui configuration
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx    # Main SOC Dashboard (polling FastAPI every 2s)
│   │   └── components/
│   │       ├── ui/         # Official shadcn/ui primitives ONLY
│   │       ├── kpi-cards.tsx
│   │       ├── incident-feed.tsx
│   │       ├── token-dialog.tsx
│   │       └── quarantine-table.tsx
└── simulate_attack.py      # CLI demo script simulating 4 distinct attacker behaviors
```
