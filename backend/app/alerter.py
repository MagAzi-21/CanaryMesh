import os
import httpx
import logging
from typing import Dict, Any
from dotenv import load_dotenv

# Path to backend/.env
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV_PATH = os.path.join(BASE_DIR, ".env")

# Ensure environment variables are loaded from backend/.env or root
if os.path.exists(ENV_PATH):
    load_dotenv(ENV_PATH)
load_dotenv()

logger = logging.getLogger("canarymesh.alerter")

async def dispatch_telegram_alert(incident_data: Dict[str, Any], trap_name: str, is_quarantined: bool):
    """
    Asynchronously sends a formatted SOC forensic alert to Telegram.
    Gracefully logs if token or chat_id is missing or on network timeout.
    STRICT ZERO-EMOJI POLICY: Uses clean bracketed SOC status tags.
    """
    # Always reload to pick up fresh .env edits dynamically
    if os.path.exists(ENV_PATH):
        load_dotenv(ENV_PATH, override=True)
    load_dotenv(override=True)

    bot_token = os.getenv("TELEGRAM_BOT_TOKEN", "").strip()
    chat_id = os.getenv("TELEGRAM_CHAT_ID", "").strip()

    severity = incident_data.get("severity", "MEDIUM")
    quarantine_status = "[ACTIVE_QUARANTINE - BANNED AT EDGE]" if is_quarantined else "[MONITORED]"
    ip = incident_data.get("ip_address", "UNKNOWN")
    incident_id = incident_data.get("incident_id", "N/A")
    vector = incident_data.get("attack_vector", "UNCLASSIFIED")
    ua = incident_data.get("user_agent", "UNKNOWN")
    path = incident_data.get("path", "/")

    # Clean plain-text message without markdown asterisks so underscores never cause 400 Bad Request
    message_text = (
        f"[SOC_ALERT] CANARYMESH INTRUSION DETECTED [{severity}]\n"
        f"========================================\n"
        f"- Incident ID: {incident_id}\n"
        f"- Threat Severity: [{severity}]\n"
        f"- Trap Name: {trap_name}\n"
        f"- Attacker IP: {ip}\n"
        f"- Attack Vector: {vector}\n"
        f"- Target Path: {path}\n"
        f"- Client Fingerprint: {ua[:60]}\n"
        f"- Automated Defense: {quarantine_status}\n"
        f"========================================\n"
        f"- Host Containment Command:\n"
        f"sudo ufw insert 1 deny from {ip} to any\n"
    )

    if not bot_token or not chat_id:
        logger.info(f"[SIMULATED TELEGRAM ALERT] Incident {incident_id} [{severity}] from {ip} -> Trap '{trap_name}' (TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not configured)")
        return

    telegram_url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": message_text,
        "disable_web_page_preview": True,
    }

    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.post(telegram_url, json=payload)
            logger.info(f"Telegram API response: {resp.status_code} {resp.text}")
            if resp.status_code == 200:
                logger.info(f"Telegram SOC alert dispatched for incident {incident_id}")
            else:
                logger.warning(f"Telegram API error {resp.status_code}: {resp.text}")
    except Exception as e:
        logger.error(f"Failed to send Telegram alert: {e}")
