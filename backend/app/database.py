import sqlite3
import os
import json
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "canarymesh.db"))

def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
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
    """)

    cursor.execute("""
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
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS quarantined_ips (
        ip_address TEXT PRIMARY KEY,
        quarantined_at TEXT NOT NULL,
        reason TEXT NOT NULL,
        hit_count INTEGER DEFAULT 0,
        ufw_command TEXT NOT NULL,
        is_active INTEGER DEFAULT 1
    );
    """)

    conn.commit()

    # Seed initial honey-tokens if none exist
    cursor.execute("SELECT COUNT(*) as cnt FROM tokens")
    count = cursor.fetchone()["cnt"]
    if count == 0:
        seed_default_tokens(cursor)
        conn.commit()

    conn.close()

def seed_default_tokens(cursor: sqlite3.Cursor):
    now = datetime.now(timezone.utc).isoformat()
    
    # 1. Decoy .env File Trap
    token_1_uuid = "550e8400-e29b-41d4-a716-446655440000"
    payload_1 = (
        "# --- PRODUCTION CLOUD INFRASTRUCTURE ---\n"
        "AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE\n"
        "AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY\n"
        "DATABASE_URL=postgresql://canary_prod:S3cur3P@ssw0rd!@db.internal.net:5432/core_prod\n"
        f"DB_BACKUP_ENDPOINT=http://127.0.0.1:8000/canary/env/{token_1_uuid}\n"
        f"AWS_INTERNAL_WEBHOOK=http://127.0.0.1:8000/canary/env/{token_1_uuid}?action=sync\n"
    )
    cursor.execute("""
    INSERT INTO tokens (token_uuid, name, type, decoy_path, payload_snippet, created_at, is_active)
    VALUES (?, ?, ?, ?, ?, ?, 1)
    """, (
        token_1_uuid,
        "Production .env Credential Leak",
        "ENV_FILE",
        f"/canary/env/{token_1_uuid}",
        payload_1,
        now
    ))

    # 2. Hidden Admin / Database Export Decoy Route
    token_2_uuid = "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
    payload_2 = (
        "# Add to robots.txt to lure recon scrapers:\n"
        "User-agent: *\n"
        "Disallow: /api/v1/internal/db-export-2026\n"
        "Disallow: /admin/backups/\n"
    )
    cursor.execute("""
    INSERT INTO tokens (token_uuid, name, type, decoy_path, payload_snippet, created_at, is_active)
    VALUES (?, ?, ?, ?, ?, ?, 1)
    """, (
        token_2_uuid,
        "Internal DB Backup Endpoint",
        "DECOY_ROUTE",
        "/api/v1/internal/db-export-2026",
        payload_2,
        now
    ))

    # 3. Live Canary API Key Trap
    token_3_uuid = "cm_live_7f9b8c2d1e0a4f5b9c8d7e6f5a4b3c2d"
    payload_3 = (
        f"# Internal Canary API Key:\n"
        f"Authorization: Bearer {token_3_uuid}\n"
        f"# Monitored endpoint: http://127.0.0.1:8000/api/v1/cloud-sync\n"
    )
    cursor.execute("""
    INSERT INTO tokens (token_uuid, name, type, decoy_path, payload_snippet, created_at, is_active)
    VALUES (?, ?, ?, ?, ?, ?, 1)
    """, (
        token_3_uuid,
        "Master Cloud-Sync Canary API Key",
        "API_KEY",
        "/api/v1/cloud-sync",
        payload_3,
        now
    ))

    # 4. Decoy Corporate SSO Login Portal
    token_4_uuid = "e7b0a880-87b3-4f9e-9b6d-88691cb52822"
    payload_4 = (
        "# Decoy Corporate Single Sign-On Portal\n"
        "URL: http://127.0.0.1:8000/corp-sso-login\n"
        "Monitors: Credential Stuffing & SQL Injection Attempts\n"
    )
    cursor.execute("""
    INSERT INTO tokens (token_uuid, name, type, decoy_path, payload_snippet, created_at, is_active)
    VALUES (?, ?, ?, ?, ?, ?, 1)
    """, (
        token_4_uuid,
        "Corporate SSO Decoy Portal",
        "DECOY_LOGIN",
        "/corp-sso-login",
        payload_4,
        now
    ))

# --- Token CRUD ---
def list_tokens() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tokens ORDER BY id ASC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_token_by_uuid(token_uuid: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tokens WHERE token_uuid = ?", (token_uuid,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def get_token_by_path(path: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tokens WHERE decoy_path = ? AND is_active = 1", (path,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def create_token(name: str, token_type: str, decoy_path: str, payload_snippet: str) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    token_uuid = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    cursor.execute("""
    INSERT INTO tokens (token_uuid, name, type, decoy_path, payload_snippet, created_at, is_active)
    VALUES (?, ?, ?, ?, ?, ?, 1)
    """, (token_uuid, name, token_type, decoy_path, payload_snippet, now))
    token_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return {
        "id": token_id,
        "token_uuid": token_uuid,
        "name": name,
        "type": token_type,
        "decoy_path": decoy_path,
        "payload_snippet": payload_snippet,
        "created_at": now,
        "is_active": True
    }

# --- Incident CRUD ---
def record_incident(
    ip_address: str,
    user_agent: str,
    method: str,
    path: str,
    headers: dict,
    query_params: dict,
    body: Optional[str],
    attack_vector: str,
    severity: str,
    token_id: Optional[int],
    is_quarantined: bool
) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    incident_id = f"INC-{uuid.uuid4().hex[:6].upper()}"
    now = datetime.now(timezone.utc).isoformat()
    
    cursor.execute("""
    INSERT INTO incidents (
        incident_id, timestamp, ip_address, user_agent, method, path,
        headers, query_params, body, attack_vector, severity, token_id, is_quarantined
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        incident_id, now, ip_address, user_agent, method, path,
        json.dumps(headers), json.dumps(query_params), body,
        attack_vector, severity, token_id, 1 if is_quarantined else 0
    ))
    inc_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return {
        "id": inc_id,
        "incident_id": incident_id,
        "timestamp": now,
        "ip_address": ip_address,
        "user_agent": user_agent,
        "method": method,
        "path": path,
        "headers": headers,
        "query_params": query_params,
        "body": body,
        "attack_vector": attack_vector,
        "severity": severity,
        "token_id": token_id,
        "is_quarantined": is_quarantined
    }

def list_incidents(limit: int = 100) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT i.*, t.name as token_name
    FROM incidents i
    LEFT JOIN tokens t ON i.token_id = t.id
    ORDER BY i.id DESC
    LIMIT ?
    """, (limit,))
    rows = cursor.fetchall()
    conn.close()
    
    results = []
    for r in rows:
        d = dict(r)
        d["headers"] = json.loads(d["headers"]) if d["headers"] else {}
        d["query_params"] = json.loads(d["query_params"]) if d["query_params"] else {}
        d["is_quarantined"] = bool(d["is_quarantined"])
        results.append(d)
    return results

def get_incident(incident_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT i.*, t.name as token_name
    FROM incidents i
    LEFT JOIN tokens t ON i.token_id = t.id
    WHERE i.incident_id = ?
    """, (incident_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    d = dict(row)
    d["headers"] = json.loads(d["headers"]) if d["headers"] else {}
    d["query_params"] = json.loads(d["query_params"]) if d["query_params"] else {}
    d["is_quarantined"] = bool(d["is_quarantined"])
    return d

def clear_incidents():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM incidents")
    cursor.execute("DELETE FROM quarantined_ips")
    conn.commit()
    conn.close()

def count_incidents_for_ip(ip_address: str) -> int:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) as cnt FROM incidents WHERE ip_address = ?", (ip_address,))
    cnt = cursor.fetchone()["cnt"]
    conn.close()
    return cnt

# --- Quarantine CRUD ---
def is_ip_quarantined(ip_address: str) -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT is_active FROM quarantined_ips WHERE ip_address = ? AND is_active = 1", (ip_address,))
    row = cursor.fetchone()
    conn.close()
    return bool(row)

def quarantine_ip(ip_address: str, reason: str):
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.now(timezone.utc).isoformat()
    ufw_cmd = f"sudo ufw insert 1 deny from {ip_address} to any"
    
    cursor.execute("""
    INSERT INTO quarantined_ips (ip_address, quarantined_at, reason, hit_count, ufw_command, is_active)
    VALUES (?, ?, ?, 0, ?, 1)
    ON CONFLICT(ip_address) DO UPDATE SET
        is_active = 1,
        reason = excluded.reason
    """, (ip_address, now, reason, ufw_cmd))
    conn.commit()
    conn.close()

def unban_ip(ip_address: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE quarantined_ips SET is_active = 0 WHERE ip_address = ?", (ip_address,))
    conn.commit()
    conn.close()

def increment_quarantine_hits(ip_address: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE quarantined_ips SET hit_count = hit_count + 1 WHERE ip_address = ?", (ip_address,))
    conn.commit()
    conn.close()

def list_quarantined_ips() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM quarantined_ips ORDER BY quarantined_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [
        {
            "ip_address": r["ip_address"],
            "quarantined_at": r["quarantined_at"],
            "reason": r["reason"],
            "hit_count": r["hit_count"],
            "ufw_command": r["ufw_command"],
            "is_active": bool(r["is_active"])
        }
        for r in rows
    ]

# --- Telemetry ---
def get_telemetry() -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) as cnt FROM tokens WHERE is_active = 1")
    active_traps = cursor.fetchone()["cnt"]

    cursor.execute("SELECT COUNT(*) as cnt FROM incidents")
    total_breaches = cursor.fetchone()["cnt"]

    cursor.execute("SELECT COUNT(*) as cnt FROM quarantined_ips WHERE is_active = 1")
    quarantined_ips = cursor.fetchone()["cnt"]

    cursor.execute("SELECT COALESCE(SUM(hit_count), 0) as total FROM quarantined_ips")
    blocked_requests = cursor.fetchone()["total"]

    cursor.execute("SELECT COUNT(*) as cnt FROM incidents WHERE severity = 'CRITICAL'")
    critical_events = cursor.fetchone()["cnt"]

    cursor.execute("SELECT COUNT(*) as cnt FROM incidents WHERE severity = 'HIGH'")
    high_events = cursor.fetchone()["cnt"]

    cursor.execute("SELECT COUNT(*) as cnt FROM incidents WHERE severity = 'MEDIUM'")
    medium_events = cursor.fetchone()["cnt"]

    conn.close()

    return {
        "active_traps": active_traps,
        "total_breaches": total_breaches,
        "quarantined_ips": quarantined_ips,
        "blocked_requests": blocked_requests,
        "critical_events": critical_events,
        "high_events": high_events,
        "medium_events": medium_events
    }

# Auto-initialize database on import
init_db()

