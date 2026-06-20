from fastapi import APIRouter
from app.schemas import LoanRequest 
from app.db.database import get_connection
from app.schemas import LoanScoreResponse
import uuid

router = APIRouter()


@router.get("/loan/score/{farmer_id}")
def get_loan_score(farmer_id: str):

	score = LoanScoreResponse(farmer_id)

	if not score:
		return {"error": "Farmer not found"}

	return score


@router.post("/loan/apply")
def apply_loan(req: LoanRequest):

	conn = get_connection()
	cur = conn.cursor()

	score = LoanScoreResponse(req.farmer_id)

	if not score or not score["loan_eligibility"]:
		return {"status": "REJECTED"}

	if req.requested_amount > score["max_loan_amount"]:
		return {
			"status": "REJECTED",
			"reason": "Requested amount exceeds eligibility"
		}

	loan_id = str(uuid.uuid4())

	cur.execute(
		"""
		INSERT INTO loan_applications
		VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
		""",
		(
			loan_id,
			req.farmer_id,
			req.batch_id,
			req.requested_amount,
			"PENDING",
			score["trust_score"],
			req.requested_amount
		)
	)

	conn.commit()

	return {
		"loan_id": loan_id,
		"status": "PENDING"
	}


@router.get("/loan/status/{loan_id}")
def loan_status(loan_id: str):

	conn = get_connection()
	cur = conn.cursor()

	cur.execute(
		"SELECT loan_status, approved_amount FROM loan_applications WHERE loan_id=?",
		(loan_id,)
	)

	row = cur.fetchone()

	if not row:
		return {"error": "Loan not found"}

	return {
		"loan_id": loan_id,
		"status": row["loan_status"],
		"approved_amount": row["approved_amount"]
	}