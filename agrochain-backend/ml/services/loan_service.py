from app.db.database import engine
from sqlalchemy import text
from app.services.blockchain_service import record_transaction


def apply_loan(farmer_id: int, amount: float):
    with engine.connect() as conn:
        result = conn.execute(text("""
            INSERT INTO loans (farmer_id, amount, status)
            VALUES (:farmer_id, :amount, 'PENDING')
        """), {"farmer_id": farmer_id, "amount": amount})
        record_transaction("loan_applied", {
            "farmer_id": farmer_id,
            "amount": amount
        })
        conn.commit()

        return {"message": "Loan application submitted"}


def get_loan_status(loan_id: int):
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT * FROM loans WHERE id = :id
        """), {"id": loan_id}).fetchone()

        if result:
            return dict(result._mapping)
        return {"error": "Loan not found"}

def calculate_loan_score(trust_score: float, farm_size: float):
	# simple logic
	score = (trust_score * 0.7) + (farm_size * 0.3)
	return score