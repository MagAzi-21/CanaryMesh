# CanaryMesh — Active Cyber-Deception & Edge Containment System

> **INSA Cyber Talent Summer Camp 2026 | Cybersecurity Stream Final Evaluation**  
> **Author:** Mikiyas Abesha Aba  
> **Candidate ID:** `CTC-5608-26`  
> **Evaluation Constraint:** 100% original, deterministic, runnable locally in < 2 minutes, zero vulnerability scanners.

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2015-black.svg?style=flat&logo=next.js)](https://nextjs.org)
[![shadcn/ui](https://img.shields.io/badge/UI-shadcn%2Fui-000000.svg?style=flat)](https://ui.shadcn.com)
[![Tailwind CSS](https://img.shields.io/badge/Style-Tailwind_CSS-38B2AC.svg?style=flat&logo=tailwind-css)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 1. Executive Overview

Traditional intrusion detection relies on passive signature scanners or reactive log monitors, flooding security operation centers (SOC) with false positives while failing to halt attackers who have already bypassed perimeter firewalls.

**CanaryMesh** flips the asymmetric advantage back to defenders through **Active Cyber-Deception**. By embedding cryptographically unique honey-tokens, decoy `.env` files, fake admin routes, and monitored API keys into production assets, any interaction constitutes a **high-confidence intrusion signal** (zero false-positive tolerance). When tripped, CanaryMesh instantly captures deep request forensics, classifies the attack vector (SQLi, Directory Recon, Stolen API Keys), dispatches real-time Telegram SOC alerts, and executes **active edge containment** to drop subsequent requests from the attacker's IP.

---

## 2. System Architecture

```text
                             [ ADVERSARY / BOT SCANNER ]
                                          │
                     1. Probes Decoy URL, Leaked .env, or SSO
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     FastAPI Active Defense Edge Gateway (:8000)                 │
│  • Edge IP Quarantine Middleware intercepts all inbound traffic                 │
│  • If IP is BANNED -> Drop immediately with HTTP 403 Forbidden                  │
│  • If IP is NOT banned -> Route to Deception Engine                             │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      Deception & Forensic Inspection Engine                     │
│  • Matches token UUID / Decoy Path                                              │
│  • Fingerprints User-Agent (curl, gobuster, sqlmap, requests vs. browsers)      │
│  • Heuristic Vector Inspection: SQL_INJECTION, PATH_TRAVERSAL, RECON_SCAN       │
│  • Assigns Threat Severity: MEDIUM / HIGH / CRITICAL                            │
│  • Delivers stealth deceptive response (401 / 403 / 503 / realistic auth error) │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │
                    ┌────────────────────┴────────────────────┐
                    ▼                                         ▼
┌────────────────────────────────────────┐  ┌────────────────────────────────────┐
│      SQLite Storage (canarymesh.db)    │  │   Active Response & Alerting       │
│  • tokens (Honey-Token registry)       │  │   • Auto-Quarantine IP in SQLite   │
│  • incidents (Deep forensic records)   │  │   • Dispatch Telegram SOC Card     │
│  • quarantined_ips (Edge blocklist)    │  │   • Generate copy-ready ufw rules  │
└───────────────────┬────────────────────┘  └────────────────────────────────────┘
                    │
                    │ Polled every 2s via CORS REST API
                    ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│               Next.js + shadcn/ui SOC Command Center Dashboard (:3000)          │
│  • KPI Telemetry Cards (Active Traps, Breaches, Quarantined IPs, Blocked Hits)  │
│  • Real-Time Incident Feed with Threat Severity Badges & Live Sonner Toasts     │
│  • Slide-Over Forensic Inspector Sheet (Headers, Payloads, 1-Click Containment) │
│  • Honey-Token Factory Dialog (Generate & copy plantable bait snippets)         │
│  • Active Quarantine Manager (View hit counts, unban, copy Linux firewall rule) │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Core Features

- **F1: Dynamic Honey-Token Factory:** Generates 4 distinct deception tripwires:
  - **Decoy `.env` Credentials:** Tracked `DB_BACKUP_URL` and `AWS_INTERNAL_WEBHOOK` embedding unique UUIDs.
  - **Hidden Admin / Backup Route:** Live traps (e.g., `/api/v1/internal/db-export-2026`) catching directory enumeration tools (`gobuster`, `dirsearch`).
  - **Canary API Key:** Monitored Bearer tokens (`cm_live_...`) detecting unauthorized API access.
  - **Decoy Corporate SSO Login (`/corp-sso-login`):** Decoy authentication portal capturing credential stuffing and SQL injection.
- **F2: Protocol-Accurate Deception:** Return realistic `401 Unauthorized`, `403 Forbidden`, `503 Service Unavailable`, or fake corporate SSO errors so attackers waste time without suspecting detection.
- **F3: Heuristic Threat Forensics:** Extracts IP (`X-Forwarded-For` aware), User-Agent classification (`sqlmap`, `gobuster`, `nikto`, `curl`), and regex-based attack vector tagging (`SQL_INJECTION`, `PATH_TRAVERSAL`, `API_KEY_ABUSE`, `RECON_SCAN`).
- **F4: Automated Active Containment (Auto-Quarantine):** Banned IPs are blocked at the edge middleware before reaching application handlers, returning `HTTP 403 Forbidden`. Provides copyable `sudo ufw insert 1 deny from <IP> to any` rules.
- **F5: Asynchronous Telegram SOC Alerts:** Dispatches formatted Markdown incident cards with severity icons, attacker IP, and attack vector within $< 500\text{ms}$.
- **F6: SOC Command Center:** Next.js + `shadcn/ui` dark-mode interface (`zinc-950` / `zinc-900`) polling every 2s with slide-over forensic packet inspection.

---

## 4. Quickstart Guide (Local Setup < 2 Minutes)

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Start the Backend API (:8000)
```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server (auto-seeds 4 honey-tokens on startup)
uvicorn app.main:app --reload --port 8000
```
> Backend runs at `http://127.0.0.1:8000`.  
> Interactive OpenAPI documentation available at `http://127.0.0.1:8000/docs`.

### 2. Start the Frontend SOC Dashboard (:3000)
In a separate terminal:
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```
> Open `http://localhost:3000` in your browser to view the real-time SOC Command Center.

### 3. Run the Attack Simulation
In a third terminal:
```bash
# Run the autonomous 4-scenario attack simulator
python simulate_attack.py
```

---

## 5. Demonstration Scenarios

`simulate_attack.py` executes 4 distinct real-world intrusion scenarios:

| Scenario | Attack Type | Vector Detected | Severity | Active Defense Action |
|---|---|---|---|---|
| **Scenario 1** | Leaked `.env` Credential Abuse | `ENV_CREDENTIAL_LEAK` | **CRITICAL** | Source IP auto-quarantined immediately. |
| **Scenario 2** | Directory Reconnaissance (`gobuster`) | `RECON_SCAN` | **MEDIUM** | Scanner identified; probe logged for analysis. |
| **Scenario 3** | Decoy SSO SQL Injection (`admin' OR '1'='1'`) | `SQL_INJECTION` | **CRITICAL** | Heuristic engine catches SQLi; IP banned. |
| **Scenario 4** | Canary API Key Abuse + Edge Block | `API_KEY_ABUSE` | **CRITICAL** | IP quarantined on probe 1; probe 2 **dropped with HTTP 403**. |

---

## 6. REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/soc/telemetry` | Live counters: active traps, breaches, quarantined IPs, blocked hits. |
| `GET` | `/api/soc/incidents` | List recent security incidents with severity and vector tags. |
| `GET` | `/api/soc/incidents/{id}` | Deep forensic detail (headers, body, query params, heuristics). |
| `DELETE` | `/api/soc/incidents/clear` | Reset incident and quarantine tables for demo replays. |
| `GET` | `/api/soc/tokens` | Retrieve all active honey-tokens and decoy routes. |
| `POST` | `/api/soc/tokens` | Mint a new honey-token with generated bait snippets. |
| `GET` | `/api/soc/quarantine` | List quarantined IPs and copyable `ufw` firewall rules. |
| `POST` | `/api/soc/quarantine` | Manually quarantine an IP address from the dashboard. |
| `POST` | `/api/soc/quarantine/{ip}/unban` | Remove an IP from active edge quarantine. |

---

## 7. Submission Details

- **Program:** INSA Cyber Talent Summer Camp 2026 (Cybersecurity Stream)
- **Candidate Name:** Mikiyas Abesha Aba
- **Candidate ID:** `CTC-5608-26`
- **Evaluation Criteria:** Deception Fidelity, Active Containment Speed, Zero-False-Positive Architecture, Visual SOC Impact.

