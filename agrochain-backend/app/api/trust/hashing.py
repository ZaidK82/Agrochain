import hashlib
import json
from typing import Union, Dict, Any

def generate_hash(data: Union[Dict, str, Any]) -> Dict:
    """
    Generate SHA-256 hash with advisory metadata.
    Deterministic - same input always produces same hash.
    """
    original_type = type(data).__name__
    
    # Convert to consistent string representation
    if isinstance(data, dict):
        data_str = json.dumps(data, sort_keys=True, ensure_ascii=False)
    elif isinstance(data, str):
        data_str = data
    else:
        data_str = str(data)
    
    if not data_str.strip():
        raise ValueError("Hash input cannot be empty")
    
    # Generate hash
    hash_value = hashlib.sha256(data_str.encode("utf-8")).hexdigest()
    
    # Return with metadata
    return {
        "hash": hash_value,
        "algorithm": "SHA-256",
        "input_type": original_type,
        "input_length": len(data_str),
        "deterministic": True
    }