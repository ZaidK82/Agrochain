from .database import get_connection

def create_tables():

	conn = get_connection()
	cur = conn.cursor()

	cur.execute("""
	CREATE TABLE IF NOT EXISTS farmers (
		id TEXT PRIMARY KEY,
		name TEXT,
		phone TEXT,
		location TEXT,
		trust_score INTEGER,
		created_at TEXT
	)
	""")

	cur.execute("""
	CREATE TABLE IF NOT EXISTS crop_batches (
		batch_id TEXT PRIMARY KEY,
		farmer_id TEXT,
		crop_name TEXT,
		area_hectare REAL,
		expected_yield REAL,
		created_at TEXT
	)
	""")

	cur.execute("""
	CREATE TABLE IF NOT EXISTS loan_applications (
		loan_id TEXT PRIMARY KEY,
		farmer_id TEXT,
		batch_id TEXT,
		loan_amount REAL,
		loan_status TEXT,
		trust_score_used INTEGER,
		approved_amount REAL,
		created_at TEXT
	)
	""")

	# Insurance Policies Table
	cur.execute("""
	CREATE TABLE IF NOT EXISTS insurance_policies (
		policy_id TEXT PRIMARY KEY,
		farmer_id TEXT,
		batch_id TEXT,
		crop_name TEXT,
		insured_amount REAL,
		premium REAL,
		status TEXT,
		created_at TEXT
	)
	""")

	# Insurance Claims Table
	cur.execute("""
	CREATE TABLE IF NOT EXISTS insurance_claims (
		claim_id TEXT PRIMARY KEY,
		policy_id TEXT,
		reason TEXT,
		claim_amount REAL,
		status TEXT,
		created_at TEXT
	)
	""")

	conn.commit()
	conn.close()