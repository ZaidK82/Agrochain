import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "agrochain.db")


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    cursor = conn.cursor()

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

    conn.commit()
    conn.close()

conn = sqlite3.connect("agrochain.db")
c = conn.cursor()

c.execute("""
CREATE TABLE IF NOT EXISTS traceability (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	batch_id TEXT,
	stage TEXT,
	location TEXT,
	timestamp TEXT
)
""")

conn.commit()
conn.close()
conn = sqlite3.connect("agrochain.db")
c = conn.cursor()

data = [
("BATCH001","Harvested","Nashik Farm","2026-03-01"),
("BATCH001","Stored","Nashik Warehouse","2026-03-02"),
("BATCH001","Transported","Truck MH15","2026-03-03"),
("BATCH001","Arrived Market","Pune APMC","2026-03-04"),
]

c.executemany(
"INSERT INTO traceability (batch_id,stage,location,timestamp) VALUES (?,?,?,?)",
data
)

conn.commit()
from app.db.database import get_connection
#from sqlalchemy import text

def create_tables():
    with  get_connection() as conn:
        conn.execute("""
        CREATE TABLE IF NOT EXISTS farmers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            location TEXT,
            trust_score FLOAT
        );
        """)

        conn.execute("""
        CREATE TABLE IF NOT EXISTS loans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            farmer_id INTEGER,
            amount FLOAT,
            status TEXT
        );
        """)

        conn.execute("""
        CREATE TABLE IF NOT EXISTS insurance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            farmer_id INTEGER,
            crop TEXT,
            coverage_amount FLOAT,
            status TEXT
        );
        """)

        conn.commit()
conn.close()