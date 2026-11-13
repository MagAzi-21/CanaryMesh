import os
import httpx
import logging
from typing import Dict, Any

logger = logging.getLogger("canarymesh.alerter")

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "").strip()
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "").strip()

async def dispatch_telegram_alert(incident_data: Dict[str, Any], trap_name: str, is_quarantined: bool):
    """
    Asynchronously sends a formatted SOC forensic alert to Telegram.
    Gracefully logs if token or chat_id is missing or on network timeout.
    STRICT ZERO-EMOJI POLICY: Uses bracketed SOC status tags.
    """
    bot_token = os.getenv("TELEGRAM_BOT_TOKEN", TELEGRAM_BOT_TOKEN).strip()
    chat_id = os.getenv("TELEGRAM_CHAT_ID", TELEGRAM_CHAT_ID).strip()

    severity = incident_data.get("severity", "MEDIUM")
    quarantine_status = "[ACTIVE_QUARANTINE - BANNED AT EDGE]" if is_quarantined else "[MONITORED]"
    ip = incident_data.get("ip_address", "UNKNOWN")
    incident_id = incident_data.get("incident_id", "N/A")
    vector = incident_data.get("attack_vector", "UNCLASSIFIED")
    ua = incident_data.get("user_agent", "UNKNOWN")
    path = incident_data.get("path", "/")

    message_text = (
        f"[SOC_ALERT] *CANARYMESH INTRUSION DETECTED* [{severity}]\n"
        f"========================================\n"
        f"* Incident ID: `{incident_id}`\n"
        f"* Threat Severity: *[{severity}]*\n"
        f"* Trap Name: `{trap_name}`\n"
        f"* Attacker IP: `{ip}`\n"
        f"* Attack Vector: `{vector}`\n"
        f"* Target Path: `{path}`\n"
        f"* Client Fingerprint: `{ua[:60]}`\n"
        f"* Automated Defense: *{quarantine_status}*\n"
        f"========================================\n"
        f"* Host Containment Command:\n"
        f"`sudo ufw insert 1 deny from {ip} to any`\n"
    )

    if not bot_token or not chat_id:
        logger.info(f"[SIMULATED TELEGRAM ALERT] Incident {incident_id} [{severity}] from {ip} -> Trap '{trap_name}'")
        return

    telegram_url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": message_text,
        "parse_mode": "Markdown",
        "disable_web_page_preview": True
    }

    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.post(telegram_url, json=payload)
            if resp.status_code != 200:
                logger.warning(f"Telegram API responded with status {resp.status_code}: {resp.text}")
            else:
                logger.info(f"Telegram SOC alert dispatched for incident {incident_id}")
    except Exception as e:
        logger.error(f"Failed to send Telegram alert: {e}")
