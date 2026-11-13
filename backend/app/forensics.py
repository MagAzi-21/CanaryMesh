import re
from typing import Dict, Any, Tuple, Optional
from fastapi import Request

SCANNER_SIGNATURES = [
    (r"sqlmap", "Automated SQLi Engine (sqlmap)"),
    (r"nikto", "Web Server Vulnerability Scanner (Nikto)"),
    (r"gobuster", "Directory Brute-Forcer (Gobuster)"),
    (r"dirsearch", "Directory Scanner (Dirsearch)"),
    (r"ffuf", "Web Fuzzer (FFUF)"),
    (r"nmap", "Network Mapper (Nmap NSE)"),
    (r"hydra", "Login Cracker (THC-Hydra)"),
    (r"python-requests", "Python Automation Script (Requests)"),
    (r"python-httpx", "Python Automation Script (HTTPX)"),
    (r"curl", "CLI HTTP Client (cURL)"),
    (r"postman", "API Development Client (Postman)"),
    (r"wget", "CLI Downloader (Wget)")
]

SQLI_PATTERNS = [
    r"(\%27)|(\')|(\-\-)|(\%23)|(#)",
    r"\b(or|and)\b\s+[\w\'\"]+\s*=\s*[\w\'\"]+",
    r"\bunion\b\s+(all\s+)?\bselect\b",
    r"\bselect\b.+\bfrom\b",
    r"\binsert\b\s+into\b",
    r"\bdrop\b\s+table\b",
    r"\bexec(\s|\+)+(s|x)p\w+",
    r"\bsleep\(\d+\)",
    r"\bbenchmark\("
]

TRAVERSAL_PATTERNS = [
    r"\.\./",
    r"\.\.\\",
    r"/etc/passwd",
    r"/etc/shadow",
    r"win\.ini",
    r"boot\.ini",
    r"%2e%2e%2f",
    r"%252e%252e%252f"
]

def extract_client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        # Take the first IP in the chain
        return forwarded.split(",")[0].strip()
    real_ip = request.headers.get("x-real-ip")
    if real_ip:
        return real_ip.strip()
    if request.client:
        return request.client.host
    return "127.0.0.1"

def fingerprint_user_agent(ua: str) -> Dict[str, Any]:
    ua_clean = ua.lower() if ua else ""
    detected_tool = None
    is_scanner = False

    for pattern, name in SCANNER_SIGNATURES:
        if re.search(pattern, ua_clean):
            detected_tool = name
            is_scanner = True
            break

    if not ua_clean:
        client_type = "BLANK_HEADER"
    elif is_scanner:
        client_type = "AUTOMATED_SCANNER"
    elif "mozilla" in ua_clean or "chrome" in ua_clean or "safari" in ua_clean or "firefox" in ua_clean:
        client_type = "STANDARD_BROWSER"
    else:
        client_type = "UNKNOWN_CLIENT"

    return {
        "raw_user_agent": ua,
        "client_type": client_type,
        "tool_name": detected_tool,
        "is_automated": is_scanner or client_type in ("BLANK_HEADER", "UNKNOWN_CLIENT")
    }

def analyze_payload_threat(
    path: str,
    method: str,
    query_params: Dict[str, Any],
    headers: Dict[str, Any],
    body_str: Optional[str],
    token_type: Optional[str] = None
) -> Tuple[str, str, Dict[str, Any]]:
    """
    Returns (attack_vector, severity, forensic_evidence)
    Severity: 'CRITICAL', 'HIGH', 'MEDIUM'
    """
    evidence = {}
    combined_target = f"{path} {body_str or ''} {' '.join(str(v) for v in query_params.values())}"
    combined_lower = combined_target.lower()

    # 1. SQL Injection Check
    for pat in SQLI_PATTERNS:
        match = re.search(pat, combined_lower, re.IGNORECASE)
        if match:
            evidence["sqli_match"] = match.group(0)
            return ("SQL_INJECTION", "CRITICAL", evidence)

    # 2. Path Traversal Check
    for pat in TRAVERSAL_PATTERNS:
        match = re.search(pat, combined_lower, re.IGNORECASE)
        if match:
            evidence["traversal_match"] = match.group(0)
            return ("PATH_TRAVERSAL", "HIGH", evidence)

    # 3. Canary Token Type specific evaluations
    if token_type == "ENV_FILE" or "/canary/env/" in path:
        evidence["trap"] = "Decoy .env Cloud Credentials Accessed"
        return ("ENV_CREDENTIAL_LEAK", "CRITICAL", evidence)

    if token_type == "API_KEY" or "cm_live_" in str(headers.get("authorization", "")) or "cm_live_" in combined_target:
        evidence["trap"] = "Compromised Canary Bearer API Key Injected"
        return ("API_KEY_ABUSE", "CRITICAL", evidence)

    if token_type == "DECOY_LOGIN" or "/corp-sso-login" in path:
        evidence["trap"] = "Credential Stuffing on Decoy Authentication Portal"
        return ("CREDENTIAL_HARVESTING", "HIGH", evidence)

    # 4. Reconnaissance & Brute-Force Check
    if "/internal/" in path or "/admin" in path or "export" in path:
        evidence["trap"] = "Unauthorized Probing of Non-Existent Internal Route"
        return ("RECON_SCAN", "MEDIUM", evidence)

    return ("SUSPICIOUS_PROBE", "MEDIUM", evidence)

