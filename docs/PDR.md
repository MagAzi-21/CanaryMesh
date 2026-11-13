### `PRD.md` (Product Requirements Document)

```markdown
# Product Requirements Document (PRD): CanaryMesh

## 1. Executive Summary
**CanaryMesh** is an active cyber-deception and automated intrusion containment platform. Rather than relying on passive vulnerability scanning or signature-heavy firewalls that generate high false-positive rates, CanaryMesh embeds high-fidelity **honey-tokens** and **decoy endpoints** inside web applications and server environments. Because legitimate users and automated business workflows never interact with hidden decoys, any interaction constitutes a **high-confidence intrusion signal**, triggering instant forensic capture, real-time Telegram SOC alerts, and automated IP quarantine.

## 2. Target Problem
- **Scanner Blind Spots & Noise:** Traditional perimeter defenses flood analysts with thousands of low-confidence alerts while missing attackers who have already bypassed outer defenses (e.g., via stolen credentials or insider threats).
- **Delayed Incident Response:** By the time log analysis detects lateral movement or credential harvesting, attackers have already exfiltrated sensitive data.

## 3. Core Features & Functional Requirements

### F1: Dynamic Honey-Token Factory
- Analysts can generate cryptographically unique tripwires via the SOC Dashboard or REST API (`POST /api/soc/tokens`).
- **Supported Trap Types:**
  1. **Decoy `.env` Credential File:** Generates a realistic `.env` snippet containing a tracked `DB_BACKUP_URL` and `AWS_INTERNAL_WEBHOOK` embedded with a unique UUID token.
  2. **Hidden Admin / Backup Route:** Creates a live trap endpoint (e.g., `/internal/v2/db-export-{id}`) designed to catch directory brute-forcing (`gobuster`/`dirsearch`) and `robots.txt` reconnaissance.
  3. **Canary API Key (`Authorization: Bearer cm_live_...`):** Detects unauthorized usage of leaked API keys in headers or query strings.
  4. **Decoy Internal Login Portal (`/corp-sso-login`):** A realistic authentication page that captures credential stuffing and SQL injection payloads without authenticating anyone.

### F2: Stealth Deception Listeners
- Trap routes return convincing, protocol-accurate HTTP responses (`401 Unauthorized`, `403 Access Denied`, `503 Service Unavailable`, or fake login failure messages) so attackers continue probing without realizing they are being monitored.

### F3: Deep Request Forensics & Threat Classification
- On every tripwire trigger, the engine extracts and stores:
  - Source IP address (`X-Forwarded-For` aware) & Timestamp (UTC/EAT).
  - HTTP Method, Target Path, Query Parameters, Headers, and Raw Request Body.
  - User-Agent fingerprinting (classifying automated tools like `curl`, `python-requests`, `sqlmap`, `nikto`, `gobuster` vs. standard browsers).
  - **Heuristic Payload Inspection:** Automatically tags incidents with attack vectors (`SQL_INJECTION`, `PATH_TRAVERSAL`, `CREDENTIAL_HARVESTING`, `RECON_SCAN`, `API_KEY_ABUSE`) and assigns a severity level (`MEDIUM`, `HIGH`, `CRITICAL`).

### F4: Automated Active Containment (Auto-Quarantine)
- Configurable auto-defense policy:
  - `CRITICAL` severity events (or any IP hitting $\ge 2$ traps) automatically add the source IP to the `quarantined_ips` store.
  - FastAPI containment middleware intercepts all subsequent requests from quarantined IPs at the edge and blocks them (`HTTP 403`).
  - Generates copy-ready Linux `ufw` / `iptables` drop commands in the UI for host-level enforcement.

### F5: Real-Time Telegram SOC Alerting
- Dispatches formatted Markdown incident cards via Telegram Bot API within $< 500\text{ms}$ of a breach, including Incident ID, Trap Name, Attacker IP, Attack Vector, User-Agent, and Auto-Ban status.

### F6: Live SOC Command Center Dashboard
- Real-time web dashboard (`http://127.0.0.1:8000`) featuring:
  - **Live Telemetry Counters:** Active Traps, Total Breaches Detected, Quarantined IPs, Blocked Follow-Up Requests.
  - **Real-Time Incident Feed:** Auto-refreshing stream with severity badges, expandable raw HTTP request inspector, and visual alert banner when a new breach occurs.
  - **Trap Management & Export:** Create new traps and copy ready-to-plant `.env` or `robots.txt` baits in one click.
  - **Quarantine Manager:** View banned IPs, blocked hit counts, and manually ban/unban IPs during incident triage.