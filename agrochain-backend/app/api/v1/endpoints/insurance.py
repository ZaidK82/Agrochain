from fastapi import APIRouter
from app.schemas import InsuranceRegisterRequest, InsuranceClaimRequest
from app.services.insurance_service import calculate_premium
from app.db.database import get_connection
import uuid

router = APIRouter()


@router.post("/insurance/register")
def register_insurance(req: InsuranceRegisterRequest):

	conn = get_connection()
	cur = conn.cursor()

	policy_id = str(uuid.uuid4())

	premium = calculate_premium(req.insured_amount)

	cur.execute(
		"""
		INSERT INTO insurance_policies
		VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
		""",
		(
			policy_id,
			req.farmer_id,
			req.batch_id,
			req.crop_name,
			req.insured_amount,
			premium,
			"ACTIVE"
		)
	)

	conn.commit()

	return {
		"policy_id": policy_id,
		"premium": premium,
		"status": "ACTIVE"
	}


@router.post("/insurance/claim")
def claim_insurance(req: InsuranceClaimRequest):

	conn = get_connection()
	cur = conn.cursor()

	claim_id = str(uuid.uuid4())

	cur.execute(
		"""
		INSERT INTO insurance_claims
		VALUES (?, ?, ?, ?, ?, datetime('now'))
		""",
		(
			claim_id,
			req.policy_id,
			req.reason,
			req.claim_amount,
			"PENDING"
		)
	)

	conn.commit()

	return {
		"claim_id": claim_id,
		"status": "PENDING"
	}


@router.get("/insurance/status/{policy_id}")
def policy_status(policy_id: str):

	conn = get_connection()
	cur = conn.cursor()

	cur.execute(
		"SELECT status, insured_amount, premium FROM insurance_policies WHERE policy_id=?",
		(policy_id,)
	)

	row = cur.fetchone()

	if not row:
		return {"error": "Policy not found"}

	return {
		"policy_id": policy_id,
		"status": row["status"],
		"insured_amount": row["insured_amount"],
		"premium": row["premium"]
	}