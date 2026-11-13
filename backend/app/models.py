from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List

class TokenBase(BaseModel):
    name: str
    type: str  # ENV_FILE, DECOY_ROUTE, API_KEY, DECOY_LOGIN
    decoy_path: str
    payload_snippet: str

class TokenCreate(BaseModel):
    name: str
    type: str = Field(..., description="ENV_FILE, DECOY_ROUTE, API_KEY, or DECOY_LOGIN")
    decoy_path: Optional[str] = None
    custom_note: Optional[str] = None

class TokenResponse(TokenBase):
    id: int
    token_uuid: str
    created_at: str
    is_active: bool

class IncidentResponse(BaseModel):
    id: int
    incident_id: str
    timestamp: str
    ip_address: str
    user_agent: str
    method: str
    path: str
    headers: Dict[str, Any]
    query_params: Dict[str, Any]
    body: Optional[str] = None
    attack_vector: str
    severity: str  # MEDIUM, HIGH, CRITICAL
    token_id: Optional[int] = None
    token_name: Optional[str] = None
    is_quarantined: bool

class QuarantinedIPResponse(BaseModel):
    ip_address: str
    quarantined_at: str
    reason: str
    hit_count: int
    ufw_command: str
    is_active: bool

class ManualBanRequest(BaseModel):
    ip_address: str
    reason: Optional[str] = "Manual SOC Operator Containment"

class TelemetryResponse(BaseModel):
    active_traps: int
    total_breaches: int
    quarantined_ips: int
    blocked_requests: int
    critical_events: int
    high_events: int
    medium_events: int

class DecoyLoginRequest(BaseModel):
    username: Optional[str] = ""
    password: Optional[str] = ""
    domain: Optional[str] = ""

