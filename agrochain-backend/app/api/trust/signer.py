from cryptography.hazmat.primitives.asymmetric import ed25519
from cryptography.hazmat.primitives import serialization
import base64

# ============================================
# KEY MANAGEMENT (In-memory for now)
# ============================================

_private_key = ed25519.Ed25519PrivateKey.generate()
_public_key = _private_key.public_key()

# ============================================
# SIGNING FUNCTIONS
# ============================================

def sign_hash(hash_value: str) -> str:
    """
    Sign a hash using Ed25519.
    Returns base64 encoded signature.
    """
    if not hash_value:
        raise ValueError("Cannot sign empty hash")
    
    signature = _private_key.sign(hash_value.encode())
    return base64.b64encode(signature).decode()

def verify_signature(hash_value: str, signature: str) -> bool:
    """
    Verify a signature using Ed25519.
    Returns True if valid, False otherwise.
    """
    if not hash_value or not signature:
        return False
    
    try:
        _public_key.verify(
            base64.b64decode(signature),
            hash_value.encode()
        )
        return True
    except Exception:
        return False

def get_public_key() -> str:
    """
    Get public key in base64 format.
    Used for audit/verification.
    """
    return base64.b64encode(
        _public_key.public_bytes(
            encoding=serialization.Encoding.Raw,
            format=serialization.PublicFormat.Raw
        )
    ).decode()