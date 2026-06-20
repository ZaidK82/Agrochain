import sqlite3
import os
from pathlib import Path

# Single database path
DB_PATH = Path(__file__).parent.parent.parent / "agrochain.db"

def get_connection():
    """Get database connection with unified path"""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize all database tables"""
    conn = get_connection()
    cursor = conn.cursor()
    
    # Prediction history table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS prediction_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            account_id TEXT NOT NULL,
            advisory_hash TEXT NOT NULL,
            issued_at TEXT,
            valid_until TEXT,
            prediction_type TEXT,
            confidence_level INTEGER,
            evaluation_status TEXT,
            actual_outcome TEXT,
            accuracy_score REAL,
            impact_weight REAL,
            final_score REAL
        )
    """)
    
    # Traceability table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS traceability (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            batch_id TEXT,
            stage TEXT,
            location TEXT,
            timestamp TEXT
        )
    """)
    
    # Farmers table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS farmers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            account_id TEXT UNIQUE,
            name TEXT,
            location TEXT,
            trust_score REAL
        )
    """)
    
    conn.commit()
    conn.close()

# Initialize on import
init_db()