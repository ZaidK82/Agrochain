import json
from pathlib import Path
from datetime import datetime
import hashlib
import time
from typing import Dict, Any, Optional, Tuple
from web3 import Web3

# ============================================
# LOCAL CHAIN (for mock/offline mode)
# ============================================

local_advisories = {}  # advisory_id -> {content_hash, version, timestamp}

def create_local_advisory(advisory_id: str, content_hash: str, source: str, expert: str) -> Dict:
    """Store advisory locally when blockchain unavailable"""
    
    # Convert hex string to bytes32 for consistency
    advisory_id_bytes = bytes.fromhex(advisory_id) if len(advisory_id) == 64 else advisory_id.encode()
    content_hash_bytes = bytes.fromhex(content_hash) if len(content_hash) == 64 else content_hash.encode()
    
    version = local_advisories.get(advisory_id, {}).get("version", 0) + 1
    
    local_advisories[advisory_id] = {
        "content_hash": content_hash,
        "version": version,
        "source": source,
        "expert": expert,
        "status": 0,  # 0 = Active (matching contract Status enum)
        "issued_at": int(time.time()),
        "expires_at": int(time.time()) + 86400 * 30,
        "mock": True
    }
    
    return {
        "status": "stored_offline",
        "advisory_id": advisory_id,
        "version": version,
        "mock": True
    }

def verify_local_advisory(advisory_id: str, content_hash: str) -> Dict:
    """Verify advisory from local storage"""
    
    stored = local_advisories.get(advisory_id)
    
    if not stored:
        return {
            "verified": False,
            "exists": False,
            "message": "Advisory not found in local storage"
        }
    
    is_valid = stored["content_hash"] == content_hash
    
    return {
        "verified": is_valid,
        "exists": True,
        "version": stored["version"],
        "status": stored["status"],
        "message": "Verified from local storage" if is_valid else "Content hash mismatch"
    }


# ============================================
# BLOCKCHAIN SERVICE CLASS (MATCHES YOUR CONTRACT)
# ============================================

class BlockchainService:
    """
    Blockchain service for AgroChain advisory registry.
    Matches the actual smart contract ABI provided.
    """
    
    def __init__(self):
        self.state = "UNINITIALIZED"
        self.w3 = None
        self.contract = None
        self.default_account = None
        self.chain_id = None
        
    def initialize(self, config_path: Optional[str] = None) -> Dict:
        """
        Initialize blockchain connection using deployment_output.json
        """
        self.config_path = config_path or Path(__file__).parent / "deployment_output.json"
        
        # Check if config file exists
        if not Path(self.config_path).exists():
            self.state = "OFFLINE"
            print(f"[BLOCKCHAIN] OFFLINE - Config not found at {self.config_path}")
            return {"status": "offline", "reason": "config_not_found"}
        
        # Load config
        try:
            with open(self.config_path, "r") as f:
                config = json.load(f)
            
            contract_address = config.get("address")
            abi = config.get("abi")
            rpc_url = config.get("rpc_url")
            
            if not contract_address or not abi:
                self.state = "OFFLINE"
                print("[BLOCKCHAIN] OFFLINE - Missing address or ABI in config")
                return {"status": "offline", "reason": "invalid_config"}
            
            # Use RPC from config or default
            if not rpc_url:
                rpc_url = "http://localhost:8545"  # Default Ganache/Hardhat
            
            # Connect Web3
            self.w3 = Web3(Web3.HTTPProvider(rpc_url))
            
            if not self.w3.is_connected():
                self.state = "OFFLINE"
                print(f"[BLOCKCHAIN] OFFLINE - Cannot connect to {rpc_url}")
                return {"status": "offline", "reason": "rpc_unreachable"}
            
            # Load contract
            self.contract = self.w3.eth.contract(
                address=Web3.to_checksum_address(contract_address),
                abi=abi
            )
            
            # Get default account (first account from node)
            if self.w3.eth.accounts:
                self.default_account = self.w3.eth.accounts[0]
                self.chain_id = self.w3.eth.chain_id
                self.state = "ONLINE"
                print(f"[BLOCKCHAIN] ONLINE - Connected to {rpc_url}, chain_id={self.chain_id}, account={self.default_account}")
                return {
                    "status": "online",
                    "chain_id": self.chain_id,
                    "account": self.default_account
                }
            else:
                self.state = "ERROR"
                print("[BLOCKCHAIN] ERROR - No accounts available")
                return {"status": "error", "reason": "no_accounts"}
                
        except Exception as e:
            self.state = "ERROR"
            print(f"[BLOCKCHAIN] ERROR - {str(e)}")
            return {"status": "error", "reason": str(e)}
    
    def get_status(self) -> Dict:
        """Get current blockchain status"""
        return {
            "state": self.state,
            "available": self.state == "ONLINE",
            "chain_id": self.chain_id,
            "account": self.default_account if self.state == "ONLINE" else None
        }
    
    # ============================================
    # CORE FUNCTIONS MATCHING YOUR CONTRACT
    # ============================================
    
    def issue_advisory(
        self,
        advisory_id: str,      # bytes32 as hex string (64 chars)
        content_hash: str,     # bytes32 as hex string (64 chars)
        source: str,           # address (0x...)
        expert: str,           # address (0x...)
        expires_at: int        # uint256 (Unix timestamp)
    ) -> Dict:
        """
        Issue advisory on blockchain using contract's issueAdvisory function.
        
        Contract signature:
        issueAdvisory(bytes32 advisoryId, bytes32 contentHash, address source, address expert, uint256 expiresAt)
        """
        
        # Validate inputs
        if not advisory_id or len(advisory_id) != 64:
            return {
                "status": "error",
                "error": f"advisory_id must be 64 hex chars, got {len(advisory_id)}",
                "mock": False
            }
        
        if not content_hash or len(content_hash) != 64:
            return {
                "status": "error",
                "error": f"content_hash must be 64 hex chars, got {len(content_hash)}",
                "mock": False
            }
        
        if not source or not source.startswith("0x"):
            return {
                "status": "error",
                "error": f"source must be valid address starting with 0x, got {source}",
                "mock": False
            }
        
        if not expert or not expert.startswith("0x"):
            return {
                "status": "error",
                "error": f"expert must be valid address starting with 0x, got {expert}",
                "mock": False
            }
        
        if expires_at <= int(time.time()):
            return {
                "status": "error",
                "error": f"expires_at must be future timestamp, got {expires_at}",
                "mock": False
            }
        
        # OFFLINE MODE
        if self.state != "ONLINE":
            result = create_local_advisory(advisory_id, content_hash, source, expert)
            return {
                "status": "stored_offline",
                "advisory_id": advisory_id,
                "content_hash": content_hash,
                "version": result.get("version", 1),
                "tx_hash": None,
                "block": None,
                "mock": True,
                "message": "Stored locally (blockchain offline)"
            }
        


        # ONLINE MODE - Call actual contract
        try:
            # Convert hex strings to bytes32
            advisory_id_bytes = bytes.fromhex(advisory_id)
            content_hash_bytes = bytes.fromhex(content_hash)

            # In the issue_advisory function, before calling contract:
            print(f"[DEBUG] Calling contract at: {self.contract.address}")
            print(f"[DEBUG] Advisory ID bytes: {advisory_id_bytes.hex()}")
            print(f"[DEBUG] Content hash bytes: {content_hash_bytes.hex()}")
            print(f"[DEBUG] Source: {source}")
            print(f"[DEBUG] Expert: {expert}")
            print(f"[DEBUG] Expires at: {expires_at}")

            # Get nonce
            nonce = self.w3.eth.get_transaction_count(self.default_account)
            
            # Build transaction
            tx = self.contract.functions.issueAdvisory(
                advisory_id_bytes,
                content_hash_bytes,
                source,
                expert,
                expires_at
            ).build_transaction({
                'from': self.default_account,
                'nonce': nonce,
                'gas': 200000,  # Estimate reasonable gas
                'gasPrice': self.w3.eth.gas_price
            })
            
            # Sign and send
            # Note: This requires private key. For now, assume node manages signing
            # If you have private key, use: signed = self.w3.eth.account.sign_transaction(tx, private_key)
            
            # For Ganache/Hardhat with unlocked accounts:
            tx_hash = self.contract.functions.issueAdvisory(
                advisory_id_bytes,
                content_hash_bytes,
                source,
                expert,
                expires_at
            ).transact({'from': self.default_account})
            
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            
            # Get version from event logs
            version = 1
            for log in receipt['logs']:
                try:
                    event = self.contract.events.AdvisoryIssued().process_log(log)
                    if event['args']['advisoryId'] == advisory_id_bytes:
                        version = event['args']['version']
                        break
                except:
                    pass
            
            return {
                "status": "stored_onchain",
                "advisory_id": advisory_id,
                "content_hash": content_hash,
                "version": version,
                "tx_hash": tx_hash.hex(),
                "block": receipt['blockNumber'],
                "mock": False,
                "message": "Successfully stored on blockchain"
            }
            
        except Exception as e:
            # Fallback to local storage on error
            result = create_local_advisory(advisory_id, content_hash, source, expert)
            return {
                "status": "stored_offline_fallback",
                "advisory_id": advisory_id,
                "content_hash": content_hash,
                "version": result.get("version", 1),
                "tx_hash": None,
                "block": None,
                "mock": True,
                "error": str(e),
                "message": f"Blockchain transaction failed: {str(e)}. Stored locally."
            }
    
    def verify_advisory(
        self,
        advisory_id: str,     # bytes32 as hex string (64 chars)
        content_hash: str     # bytes32 as hex string (64 chars)
    ) -> Dict:
        """
        Verify advisory using contract's getAdvisory function.
        
        Returns verification status including version and on-chain data.
        """
        
        # Validate inputs
        if not advisory_id or len(advisory_id) != 64:
            return {
                "verified": False,
                "error": f"advisory_id must be 64 hex chars, got {len(advisory_id)}"
            }
        
        if not content_hash or len(content_hash) != 64:
            return {
                "verified": False,
                "error": f"content_hash must be 64 hex chars, got {len(content_hash)}"
            }
        
        # OFFLINE MODE
        if self.state != "ONLINE":
            return verify_local_advisory(advisory_id, content_hash)
        
        # ONLINE MODE - Query contract
        try:
            advisory_id_bytes = bytes.fromhex(advisory_id)
            content_hash_bytes = bytes.fromhex(content_hash)
            
            # Get latest version
            latest_version = self.contract.functions.latestVersion(advisory_id_bytes).call()
            
            if latest_version == 0:
                return {
                    "verified": False,
                    "exists": False,
                    "message": "Advisory not found on blockchain"
                }
            
            # Get advisory data
            advisory = self.contract.functions.getAdvisory(advisory_id_bytes, latest_version).call()
            
            # Parse advisory tuple
            # advisory[0] = contentHash (bytes32)
            # advisory[1] = version (uint256)
            # advisory[2] = source (address)
            # advisory[3] = expert (address)
            # advisory[4] = status (uint8: 0=Active, 1=Revoked)
            # advisory[5] = issuedAt (uint256)
            # advisory[6] = expiresAt (uint256)
            
            onchain_content_hash = advisory[0].hex()
            version = advisory[1]
            status = advisory[4]
            issued_at = advisory[5]
            expires_at = advisory[6]
            
            is_verified = (onchain_content_hash == content_hash and status == 0)
            
            return {
                "verified": is_verified,
                "exists": True,
                "version": version,
                "status": "Active" if status == 0 else "Revoked",
                "issued_at": issued_at,
                "expires_at": expires_at,
                "source": advisory[2],
                "expert": advisory[3],
                "message": "Verified on blockchain" if is_verified else "Content hash mismatch or advisory revoked"
            }
            
        except Exception as e:
            return {
                "verified": False,
                "exists": None,
                "error": str(e),
                "message": f"Verification failed: {str(e)}"
            }
    
    def get_latest_version(self, advisory_id: str) -> Dict:
        """Get latest version of an advisory"""
        
        if not advisory_id or len(advisory_id) != 64:
            return {"error": "advisory_id must be 64 hex chars"}
        
        if self.state != "ONLINE":
            stored = local_advisories.get(advisory_id)
            if stored:
                return {"version": stored.get("version", 1), "mock": True}
            return {"version": 0, "exists": False}
        
        try:
            advisory_id_bytes = bytes.fromhex(advisory_id)
            version = self.contract.functions.latestVersion(advisory_id_bytes).call()
            return {"version": version, "exists": version > 0}
        except Exception as e:
            return {"error": str(e)}


# ============================================
# GLOBAL INSTANCE
# ============================================

blockchain_service = BlockchainService()

# ============================================
# FASTAPI ROUTER (Optional - matches contract)
# ============================================

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/blockchain", tags=["blockchain"])

class IssueAdvisoryRequest(BaseModel):
    advisory_id: str      # 64 hex chars
    content_hash: str     # 64 hex chars
    source: str           # 0x address
    expert: str           # 0x address
    expires_at: int       # Unix timestamp

class VerifyAdvisoryRequest(BaseModel):
    advisory_id: str
    content_hash: str

@router.get("/status")
async def get_blockchain_status():
    """Simple blockchain status endpoint for frontend"""
    try:
        status = blockchain_service.get_status()
        return {
            "status": status.get("state", "OFFLINE"),
            "available": status.get("available", False),
            "message": "Blockchain connected" if status.get("available") else "Running in offline mode"
        }
    except Exception as e:
        return {
            "status": "ERROR",
            "available": False,
            "message": f"Error: {str(e)}"
        }

@router.post("/issue")
async def issue_advisory_endpoint(request: IssueAdvisoryRequest):
    """Issue advisory on blockchain (matches contract)"""
    result = blockchain_service.issue_advisory(
        advisory_id=request.advisory_id,
        content_hash=request.content_hash,
        source=request.source,
        expert=request.expert,
        expires_at=request.expires_at
    )
    return result

@router.post("/verify")
async def verify_advisory_endpoint(request: VerifyAdvisoryRequest):
    """Verify advisory against blockchain"""
    return blockchain_service.verify_advisory(
        advisory_id=request.advisory_id,
        content_hash=request.content_hash
    )

@router.get("/version/{advisory_id}")
async def get_version(advisory_id: str):
    """Get latest version of advisory"""
    return blockchain_service.get_latest_version(advisory_id)

@router.post("/initialize")
async def initialize_blockchain(data: dict = None):
    """Initialize blockchain connection"""
    config_path = data.get("config_path") if data else None
    return blockchain_service.initialize(config_path)