import uuid
from typing import Dict, Any, Tuple

def generate_honey_token_content(token_type: str, name: str, base_url: str = "http://127.0.0.1:8000") -> Tuple[str, str]:
    """
    Returns (decoy_path, payload_snippet)
    """
    token_uuid = str(uuid.uuid4())

    if token_type == "ENV_FILE":
        decoy_path = f"/canary/env/{token_uuid}"
        payload_snippet = (
            f"# --- ENTERPRISE CLOUD REPOSITORY CONFIGURATION ---\n"
            f"ENVIRONMENT=production\n"
            f"AWS_ACCESS_KEY_ID=AKIA{token_uuid[:16].upper()}\n"
            f"AWS_SECRET_ACCESS_KEY={uuid.uuid4().hex}{uuid.uuid4().hex[:8]}\n"
            f"CANARY_SYNC_TUNNEL={base_url}{decoy_path}\n"
            f"DATABASE_URL=postgres://admin_sec:P@ss{token_uuid[:6]}!@db-master.corp.internal:5432/finance_prod\n"
        )
        return decoy_path, payload_snippet

    elif token_type == "API_KEY":
        canary_key = f"cm_live_{token_uuid.replace('-', '')}"
        decoy_path = "/api/v1/cloud-sync"
        payload_snippet = (
            f"# Canary Authorization Header:\n"
            f"Authorization: Bearer {canary_key}\n\n"
            f"# Monitored Cloud Service Target:\n"
            f"curl -X GET \"{base_url}{decoy_path}\" \\\n"
            f"     -H \"Authorization: Bearer {canary_key}\"\n"
        )
        return decoy_path, payload_snippet

    elif token_type == "DECOY_LOGIN":
        decoy_path = "/corp-sso-login"
        payload_snippet = (
            f"# Decoy Corporate Single Sign-On Portal\n"
            f"Target URL: {base_url}{decoy_path}\n"
            f"Description: Lures attackers performing credential brute-forcing, password spraying, or SQL injection.\n"
        )
        return decoy_path, payload_snippet

    else:  # DECOY_ROUTE
        route_suffix = token_uuid[:8]
        decoy_path = f"/api/v1/internal/audit-export-{route_suffix}"
        payload_snippet = (
            f"# Decoy Internal Route Bait (Plant in robots.txt or HTML comments):\n"
            f"User-agent: *\n"
            f"Disallow: {decoy_path}\n"
            f"Disallow: /admin/secret-keys/\n"
        )
        return decoy_path, payload_snippet

def get_deceptive_response(token_type: str) -> Dict[str, Any]:
    """
    Returns protocol-accurate deceptive payloads to mislead attackers.
    """
    if token_type == "ENV_FILE":
        return {
            "status_code": 503,
            "data": {
                "error": "DatabaseBackupError",
                "message": "Replication tunnel offline. Snapshot archive requires internal VPN routing key.",
                "status_code": 50302
            }
        }
    elif token_type == "API_KEY":
        return {
            "status_code": 401,
            "data": {
                "error": "Unauthorized",
                "detail": "Bearer token signature expired or scope invalid for tenant production cluster.",
                "scope": "infra:read"
            }
        }
    elif token_type == "DECOY_LOGIN":
        return {
            "status_code": 401,
            "data": {
                "success": False,
                "error": "InvalidCredentials",
                "detail": "Enterprise Single Sign-On authentication rejected. Challenge token mismatch.",
                "tenant": "corp-global-sso"
            }
        }
    else:  # DECOY_ROUTE
        return {
            "status_code": 403,
            "data": {
                "error": "Forbidden",
                "detail": "Internal diagnostics interface restricted to 10.0.0.0/8 management subnets.",
                "node": "prod-gateway-01"
            }
        }

