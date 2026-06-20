import hashlib
import json
from datetime import datetime

blockchain = []
chain = []

def record_transaction(event_type: str, data: dict):
    previous_hash = blockchain[-1]["hash"] if blockchain else "0"

    block = {
        "timestamp": str(datetime.utcnow()),
        "event": event_type,
        "data": data,
        "previous_hash": previous_hash,
    }

    block_string = json.dumps(block, sort_keys=True).encode()
    block["hash"] = hashlib.sha256(block_string).hexdigest()

    blockchain.append(block)

    return block

def add_block(data):
    block = record_transaction(data)
    chain.append(block)
    return block