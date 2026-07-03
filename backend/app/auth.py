"""Self-contained auth: PBKDF2 password hashing + HMAC-signed tokens.

Uses only the Python standard library — no external auth service, no extra
dependencies. Tokens are compact HMAC-signed JSON (a mini-JWT).
"""
import base64
import hashlib
import hmac
import json
import secrets
import time

from fastapi import Depends, Header, HTTPException

from .config import settings

_PBKDF2_ITERS = 200_000
_TOKEN_TTL = 7 * 24 * 3600  # 7 days


# --- Password hashing (PBKDF2-HMAC-SHA256) ---
def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, _PBKDF2_ITERS)
    return f"pbkdf2_sha256${_PBKDF2_ITERS}${salt.hex()}${dk.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        _algo, iters, salt_hex, hash_hex = stored.split("$")
        dk = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt_hex), int(iters))
        return hmac.compare_digest(dk.hex(), hash_hex)
    except Exception:
        return False


# --- Tokens (HMAC-signed) ---
def _b64e(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).decode().rstrip("=")


def _b64d(s: str) -> bytes:
    return base64.urlsafe_b64decode(s + "=" * (-len(s) % 4))


def _sign(body: str) -> str:
    return _b64e(hmac.new(settings.auth_secret.encode(), body.encode(), hashlib.sha256).digest())


def create_token(user_id: int, email: str) -> str:
    payload = {"sub": user_id, "email": email, "exp": int(time.time()) + _TOKEN_TTL}
    body = _b64e(json.dumps(payload).encode())
    return f"{body}.{_sign(body)}"


def verify_token(token: str):
    try:
        body, sig = token.split(".")
        if not hmac.compare_digest(sig, _sign(body)):
            return None
        payload = json.loads(_b64d(body))
        if int(payload.get("exp", 0)) < time.time():
            return None
        return payload
    except Exception:
        return None


# --- FastAPI dependency ---
def get_current_user(authorization: str = Header(default=None)) -> dict:
    """Require a valid Bearer token; returns the token payload (sub, email)."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = verify_token(authorization[7:])
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    return payload
