# System Architecture: CanaryMesh

## 1. High-Level Data Flow

```text
[ Attacker / Recon Script ]
          │
          ▼ (1. Probes decoy URL, uses leaked .env key, or submits decoy login)
┌─────────────────────────────────────────────────────────┐
│             FastAPI Edge Middleware (:8000)             │
│  • Checks `quarantined_ips` table                       │
│  • If BANNED -> Drop immediately (HTTP 403) + Log hit   │
└─────────┬───────────────────────────────────────────────┘
          │ (2. Allowed through to Trap Listener)
          ▼
┌─────────────────────────────────────────────────────────┐
│         Deception & Forensics Engine (`deception.py`)   │
│  • Matches Token UUID / Decoy Route                     │
│  • Fingerprints User-Agent & Inspects Payload           │
│  • Assigns Severity (MEDIUM / HIGH / CRITICAL)          │
└─────────┬───────────────────────┬───────────────────────┘
          │                       │
          ▼                       ▼
┌───────────────────┐   ┌─────────────────────────────────┐
│   SQLite Storage  │   │  Active Response & Alerting     │
│  • `tokens`       │   │  • Auto-Quarantine IP if Crit.  │
│  • `incidents`    │   │  • Push Telegram Forensic Card  │
│  • `quarantined`  │   └─────────────────────────────────┘
└─────────┬─────────┘
          │ (3. Polled every 2s via CORS-enabled REST API)
          ▼
┌─────────────────────────────────────────────────────────┐
│      Next.js + shadcn/ui SOC Command Center (:3000)     │
│  • shadcn Card KPIs  • shadcn Table Incident Feed       │
│  • shadcn Dialog Token Factory  • shadcn Sheet Forensics│
└─────────────────────────────────────────────────────────┘
```

---

## 2. Component Architecture

### A. Backend (`backend/app/`)
1. **`main.py`**:
   - FastAPI application entry point with CORS configured for `http://localhost:3000` and `http://127.0.0.1:3000`.
   - `QuarantineMiddleware`: Intercepts every inbound HTTP request. If the client IP exists in `quarantined_ips` with `is_active=1`, immediately rejects with `HTTP 403 Forbidden` and increments `hit_count`. (Whitelist applies to SOC endpoints so operators can always manage the platform).
   - Deception routes:
     - `GET /canary/env/{token_uuid}`: Decoy internal backup endpoint embedded in `.env`.
     - `POST /corp-sso-login` & `GET /corp-sso-login`: Decoy corporate SSO authentication portal.
     - `GET /api/v1/internal/db-export-2026`: Decoy database export route.
     - `GET /api/v1/cloud-sync`: Decoy cloud synchronizer checking for Canary API Bearer tokens.
     - `GET /t/{token_uuid}`: Generic trap catcher for dynamically generated tokens.
   - SOC Management API (`/api/soc/`):
     - `GET /api/soc/telemetry`: Real-time KPI counts.
     - `GET /api/soc/incidents`: Historical and live incident logs.
     - `GET /api/soc/incidents/{incident_id}`: Deep forensic packet details.
     - `DELETE /api/soc/incidents/clear`: Reset logs for demo resets.
     - `GET /api/soc/tokens`: List all seeded and dynamic honey-tokens.
     - `POST /api/soc/tokens`: Create new honey-tokens.
     - `GET /api/soc/quarantine`: List quarantined IPs and iptables rules.
     - `POST /api/soc/quarantine`: Manually ban an IP.
     - `POST /api/soc/quarantine/{ip}/unban`: Restore network access for an IP.

2. **`database.py`**:
   - Zero-dependency SQLite integration (`canarymesh.db`).
   - Auto-migrates schema on startup.
   - Automatically seeds 3 high-fidelity honey-tokens if empty.

3. **`forensics.py`**:
   - IP resolution (`X-Forwarded-For` with client fallback).
   - User-Agent classification (Automated Scanners: `sqlmap`, `nikto`, `gobuster`, `dirsearch`, `curl`, `python-requests` vs. Web Browsers).
   - Attack vector heuristics (Regex patterns for SQL Injection, Path Traversal, Credential Stuffing, API Key Abuse, Reconnaissance).
   - Severity scoring logic (`MEDIUM`, `HIGH`, `CRITICAL`).

4. **`deception.py`**:
   - Payload generators for `.env` files, fake API keys (`cm_live_...`), decoy routes, and fake internal responses.

5. **`alerter.py`**:
   - Non-blocking async HTTP client for Telegram Bot API webhook alerts.

---

## 3. Database Schema

```sql
CREATE TABLE IF NOT EXISTS tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token_uuid TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    decoy_path TEXT NOT NULL,
    payload_snippet TEXT NOT NULL,
    created_at TEXT NOT NULL,
    is_active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS incidents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    incident_id TEXT UNIQUE NOT NULL,
    timestamp TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    user_agent TEXT NOT NULL,
    method TEXT NOT NULL,
    path TEXT NOT NULL,
    headers TEXT NOT NULL,
    query_params TEXT NOT NULL,
    body TEXT,
    attack_vector TEXT NOT NULL,
    severity TEXT NOT NULL,
    token_id INTEGER,
    is_quarantined INTEGER DEFAULT 0,
    FOREIGN KEY(token_id) REFERENCES tokens(id)
);

CREATE TABLE IF NOT EXISTS quarantined_ips (
    ip_address TEXT PRIMARY KEY,
    quarantined_at TEXT NOT NULL,
    reason TEXT NOT NULL,
    hit_count INTEGER DEFAULT 0,
    ufw_command TEXT NOT NULL,
    is_active INTEGER DEFAULT 1
);
```

---

## 4. Frontend Architecture (`frontend/src/`)
- Built on Next.js 15 (App Router), TypeScript, and Tailwind CSS.
- **Route Layout:**
  - `/` (`src/app/page.tsx`): High-Contrast Enterprise Landing Page (Problem vs. Solution, Tripwire Matrix, Kill-Chain, Live Terminal Simulation).
  - `/dashboard` (`src/app/dashboard/page.tsx`): Standalone Operational SOC Command Center (Telemetry KPIs, Real-time feed, Forensic sheet, Quarantine manager).
- **Exclusively `shadcn/ui` components**:
  - `Card`: KPI summary statistics, Tripwire cards, and comparison matrices.
  - `Table`: Real-time incident logs and quarantine management.
  - `Sheet`: Slide-over inspector for deep packet inspection.
  - `Dialog`: Dynamic honey-token creation modal.
  - `Badge`: Threat severity color-coding (`CRITICAL` in ruby-red, `HIGH` in amber, `MEDIUM` in blue).
  - `Sonner`: Non-intrusive live breach notifications on dashboard poll.
  - `Tabs`: Switching between Incident Stream, Quarantined IPs, and Honey-Tokens.


