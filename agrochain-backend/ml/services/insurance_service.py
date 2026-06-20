from app.db.database import get_connection
from app.services.blockchain_service import record_transaction

def calculate_premium(insured_amount: float):

	# simple deterministic rule
	premium_rate = 0.05

	premium = insured_amount * premium_rate

	return premium

	record_transaction("insurance_created", {
	    "farmer_id": farmer_id,
	    "crop": crop
	})