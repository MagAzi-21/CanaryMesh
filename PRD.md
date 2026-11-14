# Product Requirements Document (PRD): CanaryMesh

## 1. Executive Summary
**CanaryMesh** is an active cyber-deception and automated intrusion containment platform built for the **INSA Cyber Talent Summer Camp 2026** (Cybersecurity Stream). Rather than relying on passive vulnerability scanning or signature-heavy firewalls that generate high false-positive rates, CanaryMesh embeds high-fidelity **honey-tokens** and **decoy endpoints** inside web applications and server environments. Because legitimate users and automated business workflows never interact with hidden decoys, any interaction constitutes a **high-confidence intrusion signal**, triggering instant forensic capture, real-time Telegram SOC alerts, and automated IP quarantine.

**Author:** Mikiyas Abesha Aba (`CTC-5608-26`)

---

## 2. Target Problem
- **Scanner Blind Spots & Alert Fatigue:** Traditional perimeter defenses flood analysts with thousands of low-confidence alerts while missing attackers who have already bypassed outer defenses (e.g., via stolen credentials or insider threats).
- **Delayed Incident Response:** By the time traditional log analysis detects lateral movement or credential harvesting, attackers have already exfiltrated sensitive data.
- **Actionable Containment Gap:** Most detection tools notify but do not isolate the threat, leaving a critical response window open for attackers.

---

## 3. Core Features & Functional Requirements

### F1: Dynamic Honey-Token Factory
- Analysts can generate cryptographically unique tripwires via the SOC Dashboard or REST API (`POST /api/soc/tokens`).
- **Supported Trap Types:**
  1. **Decoy `.env` Credential File:** Generates a realistic `.env` snippet containing a tracked `DB_BACKUP_URL` and `AWS_INTERNAL_WEBHOOK` embedded with a unique UUID token.
  2. **Hidden Admin / Backup Route:** Creates a live trap endpoint (e.g., `/api/v1/internal/db-export-2026`) designed to catch directory brute-forcing (`gobuster`, `dirsearch`, `ffuf`) and `robots.txt` reconnaissance.
  3. **Canary API Key (`Authorization: Bearer cm_live_...`):** Detects unauthorized usage of leaked API keys in headers or query strings across public or internal endpoints.
  4. **Decoy Internal Login Portal (`/corp-sso-login`):** A realistic authentication portal that captures credential stuffing and SQL injection payloads without authenticating anyone.

### F2: Stealth Deception Listeners
- Trap routes return convincing, protocol-accurate HTTP responses (`401 Unauthorized`, `403 Access Denied`, `503 Service Unavailable`, or fake corporate authentication failure messages) so attackers continue probing without realizing they are trapped.

### F3: Deep Request Forensics & Threat Classification
- On every tripwire trigger, the engine extracts and stores:
  - Source IP address (`X-Forwarded-For` aware) and timestamp (UTC/ISO-8601).
  - HTTP Method, Target Path, Query Parameters, Headers, and Raw Request Body.
  - User-Agent fingerprinting (classifying automated tools like `curl`, `python-requests`, `sqlmap`, `nikto`, `gobuster` vs. standard web browsers).
  - **Heuristic Payload Inspection:** Automatically tags incidents with attack vectors (`SQL_INJECTION`, `PATH_TRAVERSAL`, `CREDENTIAL_HARVESTING`, `RECON_SCAN`, `API_KEY_ABUSE`) and assigns a severity level (`MEDIUM`, `HIGH`, `CRITICAL`).

### F4: Automated Active Containment (Auto-Quarantine)
- Configurable auto-defense policy:
  - `CRITICAL` severity events (or any IP hitting $\ge 2$ traps) automatically add the source IP to the `quarantined_ips` store.
  - FastAPI containment middleware intercepts all subsequent requests from quarantined IPs at the edge and drops them (`HTTP 403 Forbidden`).
  - Generates copy-ready Linux `ufw` / `iptables` drop commands in the UI for host-level OS enforcement (`sudo ufw insert 1 deny from <IP> to any`).

### F5: Real-Time Telegram SOC Alerting
- Dispatches formatted Markdown incident cards via Telegram Bot API within $< 500\text{ms}$ of a breach, including Incident ID, Trap Name, Attacker IP, Attack Vector, User-Agent, and Auto-Ban status.

### F6: Dual-Route Architecture & Enterprise UI
- **Enterprise Landing Page (`http://localhost:3000/`):**
  - High-contrast dark-mode presentation with sticky navigation, anchor sections (`#problem`, `#tripwires`, `#killchain`), and live simulated terminal preview.
  - Comparative analysis: Passive vulnerability scanners vs. Active cyber-deception (0% false positives).
  - 4-card Tripwire Matrix and 3-Step Active Kill-Chain overview.
  - Clean project attribution in the footer.
- **Operational SOC Command Center (`http://localhost:3000/dashboard`):**
  - Standalone enterprise monitoring interface polling FastAPI every 2 seconds:
  - **Live Telemetry Counters:** Active Traps, Total Breaches Detected, Quarantined IPs, Blocked Follow-Up Requests.
  - **Real-Time Incident Feed:** Auto-refreshing stream with severity badges, expandable raw HTTP request inspector, and visual alert toast when a new breach occurs.
  - **Trap Management & Export:** Create new traps and copy ready-to-plant `.env` or `robots.txt` baits in one click.
  - **Quarantine Manager:** View banned IPs, blocked hit counts, and manually ban/unban IPs during incident triage.


