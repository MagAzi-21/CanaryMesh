### Updated `ARCHITECTURE.md` (Synced with Next.js + `shadcn/ui`)

```markdown
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