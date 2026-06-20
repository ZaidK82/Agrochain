from backend.blockchain import store_hash, verify_hash as verify_onchain
from backend.trust.signer import sign_hash, verify_signature
from datetime import datetime

# Temporary in-memory ledger (can be blockchain / DB later)
LEDGER = []

def register_record(data_hash, signature):
	"""
	Register hash + signature into trust ledger
	"""
	record = {
		"hash": data_hash,
		"signature": signature,
		"timestamp": datetime.utcnow().isoformat()
	}

	LEDGER.append(record)

	return {
		"status": "registered",
		"record_id": len(LEDGER),
		"timestamp": record["timestamp"]
	}

_registry = []

def register_advisory(advisory: dict):
	hash_val = hash(advisory)
	signature = sign_hash(hash_val)
	tx = store_hash(hash_val)

	entry = {
		"hash": hash_val,
		"signature": signature,
		"tx": tx
	}
	_registry.append(entry)
	return entry

def list_registry():
	return _registry

def verify_advisory(advisory: dict):
	hash_val = hash(advisory)
	onchain = verify_onchain(hash_val)
	return {
		"hash": hash_val,
		"onchain": onchain
	}
