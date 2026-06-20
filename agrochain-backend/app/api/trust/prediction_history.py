from datetime import datetime
from app.api.db.database import get_connection


# ----------------------------------------
# TABLE INITIALIZATION
# ----------------------------------------

def init_prediction_table():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS prediction_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            account_id TEXT NOT NULL,
            advisory_hash TEXT NOT NULL,
            issued_at TEXT NOT NULL,
            valid_until TEXT NOT NULL,
            prediction_type TEXT,
            confidence_level INTEGER,
            evaluation_status TEXT DEFAULT 'pending',
            actual_outcome TEXT,
            accuracy_score INTEGER,
            impact_weight INTEGER DEFAULT 1,
            final_score INTEGER
        )
    """)

    conn.commit()
    conn.close()


# ----------------------------------------
# INSERT PREDICTION
# ----------------------------------------

def store_prediction(
    account_id: str,
    advisory_hash: str,
    issued_at: datetime,
    valid_until: datetime,
    prediction_type: str,
    confidence_level: int
):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO prediction_history (
            account_id,
            advisory_hash,
            issued_at,
            valid_until,
            prediction_type,
            confidence_level
        )
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        account_id,
        advisory_hash,
        issued_at.isoformat(),
        valid_until.isoformat(),
        prediction_type,
        confidence_level
    ))

    conn.commit()
    conn.close()


# ----------------------------------------
# UPDATE EVALUATION
# ----------------------------------------

def evaluate_prediction(
    prediction_id: int,
    actual_outcome: str,
    accuracy_score: int
):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE prediction_history
        SET evaluation_status = 'evaluated',
            actual_outcome = ?,
            accuracy_score = ?,
            final_score = accuracy_score * impact_weight
        WHERE id = ?
    """, (actual_outcome, accuracy_score, prediction_id))

    conn.commit()
    conn.close()


# ----------------------------------------
# FETCH ACCOUNT HISTORY
# ----------------------------------------

def get_account_predictions(account_id: str):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT * FROM prediction_history
        WHERE account_id = ?
    """, (account_id,))

    rows = cursor.fetchall()
    conn.close()

    return rows

import json
from datetime import datetime
from typing import Dict, Any, Optional
from app.api.db.database import get_connection

def store_advisory_record(
    account_id: str,
    advisory_id: str,
    content_hash: str,
    signature: str,
    blockchain_status: str,
    prediction_data: Dict[str, Any],
    trust_metadata: Dict[str, Any]
) -> int:
    """
    Store advisory record with full trust metadata for audit trail.
    Returns record ID.
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    # Ensure table exists with new columns
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS advisory_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            account_id TEXT NOT NULL,
            advisory_id TEXT NOT NULL,
            content_hash TEXT NOT NULL,
            signature TEXT,
            blockchain_status TEXT,
            verification_status TEXT,
            prediction_data TEXT,
            trust_metadata TEXT,
            created_at TEXT,
            expires_at INTEGER
        )
    """)
    
    now = datetime.now().isoformat()
    expires_at = trust_metadata.get("expires_at", 0)
    
    cursor.execute("""
        INSERT INTO advisory_records (
            account_id,
            advisory_id,
            content_hash,
            signature,
            blockchain_status,
            verification_status,
            prediction_data,
            trust_metadata,
            created_at,
            expires_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        account_id,
        advisory_id,
        content_hash,
        signature,
        blockchain_status,
        trust_metadata.get("verification_status", "unknown"),
        json.dumps(prediction_data),
        json.dumps(trust_metadata),
        now,
        expires_at
    ))
    
    conn.commit()
    record_id = cursor.lastrowid
    conn.close()
    
    return record_id

def get_advisory_record(advisory_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve advisory record by ID"""
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT * FROM advisory_records
        WHERE advisory_id = ?
        ORDER BY created_at DESC
        LIMIT 1
    """, (advisory_id,))
    
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return {
            "id": row[0],
            "account_id": row[1],
            "advisory_id": row[2],
            "content_hash": row[3],
            "signature": row[4],
            "blockchain_status": row[5],
            "verification_status": row[6],
            "prediction_data": json.loads(row[7]),
            "trust_metadata": json.loads(row[8]),
            "created_at": row[9],
            "expires_at": row[10]
        }
    
    return None


