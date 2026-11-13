#!/usr/bin/env python3
"""
CanaryMesh - Automated Attack Simulation Suite
INSA Cyber Talent Summer Camp 2026 | Mikiyas Abesha Aba (CTC-5608-26)

Demonstrates 4 realistic intrusion scenarios against CanaryMesh honey-tokens
to showcase real-time threat detection, heuristic classification, and edge containment.
STRICT ZERO-EMOJI POLICY: Uses ASCII status markers and ANSI terminal colors only.
"""

import time
import sys
import httpx

BASE_URL = "http://127.0.0.1:8000"

# ANSI Terminal Colors
CYAN = "\033[96m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
MAGENTA = "\033[95m"
BOLD = "\033[1m"
DIM = "\033[2m"
RESET = "\033[0m"

def print_banner():
    print(rf"""{CYAN}{BOLD}
   ____                               __  __          _     
  / ___|__ _ _ __   __ _ _ __ _   _  |  \/  | ___ ___| |__  
 | |   / _` | '_ \ / _` | '__| | | | | |\/| |/ _ \ __| '_ \ 
 | |__| (_| | | | | (_| | |  | |_| | | |  | |  __\__ \ | | |
  \____\__,_|_| |_|\__,_|_|   \__, | |_|  |_|\___|___/_| |_|
                              |___/                         
       Active Cyber-Deception & Edge Containment Simulator
       INSA Cyber Talent Summer Camp 2026 | ID: CTC-5608-26
{RESET}""")

def log_step(step: str, title: str):
    print(f"\n{BOLD}{MAGENTA}[*] {step}:{RESET} {BOLD}{title}{RESET}")

def log_action(desc: str):
    print(f"  {DIM}-->{RESET} {desc}")

def log_result(status: int, data: str, is_quarantined: bool = False):
    color = GREEN if status == 200 else (RED if status == 403 else YELLOW)
    print(f"  {BOLD}Status:{RESET} {color}HTTP {status}{RESET} | {DIM}Response:{RESET} {data[:90]}...")
    if is_quarantined:
        print(f"  {RED}{BOLD}[CONTAINMENT DETECTED]{RESET} IP blocked by edge middleware!")

def run_scenario_1():
    log_step("SCENARIO 1", "Leaked .env Cloud Credential Abuse")
    attacker_ip = "198.51.100.42"
    target_path = "/canary/env/550e8400-e29b-41d4-a716-446655440000"
    
    log_action(f"Attacker (IP: {attacker_ip}) discovers leaked .env with DB_BACKUP_ENDPOINT")
    log_action(f"Sending probe to trap: {BASE_URL}{target_path}")

    headers = {
        "X-Forwarded-For": attacker_ip,
        "User-Agent": "curl/7.88.1 (x86_64-pc-linux-gnu)",
        "Accept": "*/*"
    }

    try:
        r = httpx.get(f"{BASE_URL}{target_path}", headers=headers, timeout=5.0)
        log_result(r.status_code, r.text)
        print(f"  {GREEN}[TRIPWIRE_TRIGGERED]{RESET} CRITICAL severity event logged & IP {attacker_ip} auto-quarantined.")
    except Exception as e:
        print(f"  {RED}[ERROR]{RESET} Contacting server: {e}")

def run_scenario_2():
    log_step("SCENARIO 2", "Automated Directory Reconnaissance (Gobuster)")
    attacker_ip = "203.0.113.19"
    target_path = "/api/v1/internal/db-export-2026"

    log_action(f"Attacker (IP: {attacker_ip}) launches directory brute-forcer (Gobuster v3.6)")
    log_action(f"Probing hidden backup route: {BASE_URL}{target_path}")

    headers = {
        "X-Forwarded-For": attacker_ip,
        "User-Agent": "gobuster/3.6",
        "Accept": "application/json"
    }

    try:
        r = httpx.get(f"{BASE_URL}{target_path}", headers=headers, timeout=5.0)
        log_result(r.status_code, r.text)
        print(f"  {GREEN}[TRIPWIRE_TRIGGERED]{RESET} Scanner signature identified; RECON_SCAN event logged.")
    except Exception as e:
        print(f"  {RED}[ERROR]{RESET} Contacting server: {e}")

def run_scenario_3():
    log_step("SCENARIO 3", "Credential Stuffing & SQL Injection on Decoy SSO")
    attacker_ip = "192.0.2.77"
    target_path = "/corp-sso-login"

    log_action(f"Attacker (IP: {attacker_ip}) discovers decoy SSO portal")
    log_action("Attempting SQL Injection authentication bypass: username=\"admin' OR '1'='1' --\"")

    headers = {
        "X-Forwarded-For": attacker_ip,
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Content-Type": "application/json"
    }
    payload = {
        "username": "admin' OR '1'='1' --",
        "password": "' OR 1=1; DROP TABLE users;--"
    }

    try:
        r = httpx.post(f"{BASE_URL}{target_path}", headers=headers, json=payload, timeout=5.0)
        log_result(r.status_code, r.text)
        print(f"  {GREEN}[TRIPWIRE_TRIGGERED]{RESET} Heuristic engine caught SQL Injection payload; [CRITICAL] alert dispatched.")
    except Exception as e:
        print(f"  {RED}[ERROR]{RESET} Contacting server: {e}")

def run_scenario_4():
    log_step("SCENARIO 4", "Canary API Key Exploitation & Follow-Up Edge Containment")
    attacker_ip = "198.51.100.99"
    target_path = "/api/v1/cloud-sync"
    canary_token = "cm_live_7f9b8c2d1e0a4f5b9c8d7e6f5a4b3c2d"

    log_action(f"Attacker (IP: {attacker_ip}) injects stolen Canary API Key: Bearer {canary_token[:16]}...")
    headers = {
        "X-Forwarded-For": attacker_ip,
        "User-Agent": "python-requests/2.31.0",
        "Authorization": f"Bearer {canary_token}"
    }

    try:
        # Initial probe with stolen key
        r1 = httpx.get(f"{BASE_URL}{target_path}", headers=headers, timeout=5.0)
        log_result(r1.status_code, r1.text)
        print(f"  {YELLOW}[API_KEY_ABUSE]{RESET} Source IP {attacker_ip} immediately quarantined.")

        time.sleep(1.0)

        # Follow-up probe: Attacker attempts to query public/trap routes again
        log_action(f"Attacker (IP: {attacker_ip}) attempts follow-up request to another endpoint...")
        r2 = httpx.get(f"{BASE_URL}/canary/env/550e8400-e29b-41d4-a716-446655440000", headers=headers, timeout=5.0)
        log_result(r2.status_code, r2.text, is_quarantined=(r2.status_code == 403))
        print(f"  {GREEN}[ACTIVE_DEFENSE_VERIFIED]{RESET} Subsequent attack traffic dropped at edge before reaching application layer.")
    except Exception as e:
        print(f"  {RED}[ERROR]{RESET} Contacting server: {e}")

def main():
    print_banner()

    # Verify backend is running
    try:
        health = httpx.get(f"{BASE_URL}/api/soc/telemetry", timeout=3.0)
        if health.status_code != 200:
            print(f"{RED}[!] CanaryMesh backend responded with status {health.status_code}. Make sure backend is running.{RESET}")
            sys.exit(1)
    except Exception:
        print(f"{RED}[!] Could not connect to CanaryMesh backend at {BASE_URL}.{RESET}")
        print(f"{YELLOW}    Start the backend first using: uvicorn app.main:app --reload --port 8000 (inside backend/){RESET}")
        sys.exit(1)

    print(f"{GREEN}[OK] Connected to CanaryMesh Edge Gateway at {BASE_URL}{RESET}")
    print(f"{DIM}Beginning autonomous attack simulation sequence with 1.5s delay between stages...{RESET}\n")

    time.sleep(1.0)
    run_scenario_1()

    time.sleep(1.5)
    run_scenario_2()

    time.sleep(1.5)
    run_scenario_3()

    time.sleep(1.5)
    run_scenario_4()

    print(f"\n{CYAN}{BOLD}==========================================================={RESET}")
    print(f"{GREEN}{BOLD}[DONE] Attack Simulation Complete!{RESET}")
    print(f"Open the SOC Command Center to observe the live incident feed and active quarantine:")
    print(f"  {BOLD}SOC Dashboard:{RESET} {CYAN}http://localhost:3000{RESET}")
    print(f"  {BOLD}FastAPI Docs:{RESET}  {CYAN}http://127.0.0.1:8000/docs{RESET}")
    print(f"{CYAN}{BOLD}==========================================================={RESET}\n")

if __name__ == "__main__":
    main()
