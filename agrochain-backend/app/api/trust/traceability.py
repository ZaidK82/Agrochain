import sqlite3

DB = "agrochain.db"

def get_trace(batch_id: str):

	conn = sqlite3.connect(DB)
	cursor = conn.cursor()

	cursor.execute(
	"""
	SELECT stage, location, timestamp
	FROM traceability
	WHERE batch_id = ?
	ORDER BY timestamp
	""",
	(batch_id,)
	)

	rows = cursor.fetchall()
	conn.close()

	trace = []
	for r in rows:
		trace.append({
			"stage": r[0],
			"location": r[1],
			"time": r[2]
		})

	return trace