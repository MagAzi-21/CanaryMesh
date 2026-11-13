import os
import json
import logging
from contextlib import asynccontextmanager
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, Request, Response, BackgroundTasks, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, PlainTextResponse, HTMLResponse

from app import database, models, forensics, deception, alerter

# Setup logger
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("canarymesh.main")

AUTO_BAN_THRESHOLD = int(os.getenv("AUTO_BAN_THRESHOLD", "2"))

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB & Seed Honey-Tokens
    database.init_db()
    logger.info("CanaryMesh Deception Engine initialized. Honey-tokens seeded.")
    yield
    logger.info("CanaryMesh shutting down.")

app = FastAPI(
    title="CanaryMesh Active Defense API",
    description="Deception-Based Intrusion Detection & Automated Containment System",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration for Next.js SOC Dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Active IP Quarantine Edge Middleware
@app.middleware("http")
async def active_quarantine_middleware(request: Request, call_next):
    path = request.url.path
    client_ip = forensics.extract_client_ip(request)

    # Exempt SOC API and documentation routes so SOC analysts can always manage the platform
    if path.startswith("/api/soc") or path.startswith("/docs") or path.startswith("/openapi.json"):
        return await call_next(request)

    # Check if client IP is currently quarantined
    if database.is_ip_quarantined(client_ip):
        database.increment_quarantine_hits(client_ip)
        logger.warning(f"[QUARANTINE ENFORCED] Blocked inbound request from quarantined IP: {client_ip} to {path}")
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={
                "error": "Forbidden",
                "detail": "Access Denied: Source IP quarantined by CanaryMesh Active Defense System.",
                "ip": client_ip,
                "containment": "ACTIVE_FIREWALL_BLOCK"
            }
        )

    return await call_next(request)

# --- Core Trap Trigger Logic ---
async def process_trap_trigger(
    request: Request,
    token_type: str,
    trap_name: str,
    token_id: Optional[int] = None,
    background_tasks: Optional[BackgroundTasks] = None
) -> JSONResponse:
    client_ip = forensics.extract_client_ip(request)
    ua_string = request.headers.get("user-agent", "")
    ua_info = forensics.fingerprint_user_agent(ua_string)

    # Extract headers safely
    raw_headers = dict(request.headers)
    query_params = dict(request.query_params)

    # Extract raw body safely
    try:
        body_bytes = await request.body()
        body_str = body_bytes.decode("utf-8", errors="replace") if body_bytes else None
    except Exception:
        body_str = None

    # Analyze threat heuristics
    attack_vector, severity, evidence = forensics.analyze_payload_threat(
        path=request.url.path,
        method=request.method,
        query_params=query_params,
        headers=raw_headers,
        body_str=body_str,
        token_type=token_type
    )

    # Auto-quarantine decision
    previous_hits = database.count_incidents_for_ip(client_ip)
    should_quarantine = (severity == "CRITICAL") or (previous_hits + 1 >= AUTO_BAN_THRESHOLD)

    if should_quarantine:
        reason = f"Automated Defense: {attack_vector} ({severity})"
        database.quarantine_ip(client_ip, reason)
        logger.critical(f"[ACTIVE DEFENSE TRIGGERED] Auto-quarantined IP {client_ip} Reason: {reason}")

    # Record incident
    incident = database.record_incident(
        ip_address=client_ip,
        user_agent=ua_string,
        method=request.method,
        path=request.url.path,
        headers=raw_headers,
        query_params=query_params,
        body=body_str,
        attack_vector=attack_vector,
        severity=severity,
        token_id=token_id,
        is_quarantined=should_quarantine
    )

    # Dispatch Telegram Alert (Background async)
    if background_tasks:
        background_tasks.add_task(
            alerter.dispatch_telegram_alert,
            incident_data=incident,
            trap_name=trap_name,
            is_quarantined=should_quarantine
        )
    else:
        await alerter.dispatch_telegram_alert(
            incident_data=incident,
            trap_name=trap_name,
            is_quarantined=should_quarantine
        )

    # Deliver protocol-accurate deceptive response
    decoy = deception.get_deceptive_response(token_type)
    return JSONResponse(status_code=decoy["status_code"], content=decoy["data"])

# --- Deception & Honey-Token Listener Endpoints ---

@app.get("/robots.txt", response_class=PlainTextResponse)
async def robots_txt(request: Request, background_tasks: BackgroundTasks):
    """
    Decoy robots.txt designed to lure automated crawlers into honey-routes.
    """
    return (
        "User-agent: *\n"
        "Disallow: /api/v1/internal/db-export-2026\n"
        "Disallow: /corp-sso-login\n"
        "Disallow: /admin/backups/\n"
    )

@app.get("/.env")
@app.post("/.env")
async def trap_root_env(request: Request, background_tasks: BackgroundTasks):
    return await process_trap_trigger(
        request=request,
        token_type="ENV_FILE",
        trap_name="Direct Root .env Probe",
        background_tasks=background_tasks
    )

@app.get("/canary/env/{token_uuid}")
@app.post("/canary/env/{token_uuid}")
async def trap_env_token(token_uuid: str, request: Request, background_tasks: BackgroundTasks):
    token = database.get_token_by_uuid(token_uuid)
    trap_name = token["name"] if token else "Decoy .env Backup Endpoint"
    token_id = token["id"] if token else None
    return await process_trap_trigger(
        request=request,
        token_type="ENV_FILE",
        trap_name=trap_name,
        token_id=token_id,
        background_tasks=background_tasks
    )

@app.get("/api/v1/internal/db-export-2026")
@app.post("/api/v1/internal/db-export-2026")
async def trap_hidden_db_export(request: Request, background_tasks: BackgroundTasks):
    token = database.get_token_by_path("/api/v1/internal/db-export-2026")
    trap_name = token["name"] if token else "Internal DB Backup Endpoint"
    token_id = token["id"] if token else None
    return await process_trap_trigger(
        request=request,
        token_type="DECOY_ROUTE",
        trap_name=trap_name,
        token_id=token_id,
        background_tasks=background_tasks
    )

@app.get("/api/v1/cloud-sync")
@app.post("/api/v1/cloud-sync")
async def trap_cloud_sync(request: Request, background_tasks: BackgroundTasks):
    token = database.get_token_by_path("/api/v1/cloud-sync")
    trap_name = token["name"] if token else "Cloud-Sync Canary API Key Trap"
    token_id = token["id"] if token else None
    return await process_trap_trigger(
        request=request,
        token_type="API_KEY",
        trap_name=trap_name,
        token_id=token_id,
        background_tasks=background_tasks
    )

@app.get("/corp-sso-login", response_class=HTMLResponse)
async def decoy_sso_page():
    """
    Renders a realistic dark corporate single-sign-on portal.
    """
    return """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Internal Enterprise SSO | Core Systems</title>
    <style>
        body { background: #09090b; color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
        .card { background: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 32px; width: 360px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
        h2 { margin-top: 0; font-size: 1.25rem; font-weight: 600; color: #fafafa; }
        p { color: #a1a1aa; font-size: 0.85rem; margin-bottom: 24px; }
        label { display: block; font-size: 0.8rem; color: #d4d4d8; margin-bottom: 6px; }
        input { width: 100%; box-sizing: border-box; background: #09090b; border: 1px solid #27272a; border-radius: 6px; padding: 10px; color: #fff; margin-bottom: 16px; font-size: 0.9rem; }
        button { width: 100%; background: #2563eb; color: #fff; border: none; border-radius: 6px; padding: 10px; font-weight: 500; cursor: pointer; transition: background 0.2s; }
        button:hover { background: #1d4ed8; }
        .badge { display: inline-block; background: #27272a; color: #71717a; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-family: monospace; margin-bottom: 16px; }
    </style>
</head>
<body>
    <div class="card">
        <span class="badge">CORP-SSO-V3</span>
        <h2>Internal Staff Login</h2>
        <p>Restricted access for Authorized Engineering & DevOps personnel only.</p>
        <form method="POST" action="/corp-sso-login">
            <label>Enterprise Email / Username</label>
            <input type="text" name="username" placeholder="user@corp.internal" required>
            <label>Corporate Password</label>
            <input type="password" name="password" placeholder="••••••••••••" required>
            <button type="submit">Authenticate with MFA</button>
        </form>
    </div>
</body>
</html>"""

@app.post("/corp-sso-login")
async def trap_sso_post(request: Request, background_tasks: BackgroundTasks):
    token = database.get_token_by_path("/corp-sso-login")
    trap_name = token["name"] if token else "Corporate SSO Decoy Portal"
    token_id = token["id"] if token else None
    return await process_trap_trigger(
        request=request,
        token_type="DECOY_LOGIN",
        trap_name=trap_name,
        token_id=token_id,
        background_tasks=background_tasks
    )

@app.get("/t/{token_uuid}")
@app.post("/t/{token_uuid}")
async def trap_generic_catcher(token_uuid: str, request: Request, background_tasks: BackgroundTasks):
    token = database.get_token_by_uuid(token_uuid)
    if not token:
        token = database.get_token_by_path(f"/t/{token_uuid}")
    trap_name = token["name"] if token else f"Custom Dynamic Honey-Token ({token_uuid[:8]})"
    token_type = token["type"] if token else "DECOY_ROUTE"
    token_id = token["id"] if token else None
    return await process_trap_trigger(
        request=request,
        token_type=token_type,
        trap_name=trap_name,
        token_id=token_id,
        background_tasks=background_tasks
    )

# --- SOC Command Center REST API ---

@app.get("/api/soc/telemetry", response_model=models.TelemetryResponse)
def get_soc_telemetry():
    return database.get_telemetry()

@app.get("/api/soc/incidents", response_model=List[models.IncidentResponse])
def get_soc_incidents(limit: int = 100):
    return database.list_incidents(limit=limit)

@app.get("/api/soc/incidents/{incident_id}", response_model=models.IncidentResponse)
def get_soc_incident_detail(incident_id: str):
    inc = database.get_incident(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident record not found")
    return inc

@app.delete("/api/soc/incidents/clear")
def clear_soc_logs():
    database.clear_incidents()
    return {"status": "success", "message": "All incident and quarantine logs cleared for demo reset."}

@app.get("/api/soc/tokens", response_model=List[models.TokenResponse])
def get_soc_tokens():
    return database.list_tokens()

@app.post("/api/soc/tokens", response_model=models.TokenResponse)
def create_soc_token(payload: models.TokenCreate):
    decoy_path, snippet = deception.generate_honey_token_content(
        token_type=payload.type,
        name=payload.name
    )
    if payload.decoy_path:
        decoy_path = payload.decoy_path

    token = database.create_token(
        name=payload.name,
        token_type=payload.type,
        decoy_path=decoy_path,
        payload_snippet=snippet
    )
    return token

@app.get("/api/soc/quarantine", response_model=List[models.QuarantinedIPResponse])
def get_soc_quarantine_list():
    return database.list_quarantined_ips()

@app.post("/api/soc/quarantine")
def manual_ban_ip(payload: models.ManualBanRequest):
    database.quarantine_ip(payload.ip_address, payload.reason or "Manual SOC Operator Containment")
    return {"status": "success", "message": f"IP {payload.ip_address} has been quarantined."}

@app.post("/api/soc/quarantine/{ip_address}/unban")
def unban_ip_address(ip_address: str):
    database.unban_ip(ip_address)
    return {"status": "success", "message": f"IP {ip_address} has been removed from quarantine."}

