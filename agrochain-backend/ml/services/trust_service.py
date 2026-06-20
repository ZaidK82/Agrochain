from statistics import mean, pstdev
from datetime import datetime, timezone
from app.api.db import get_connection

BASELINE_SCORE = 60

def compute_trust_score(account_id: str) -> dict:
    # paste your cleaned trust_score function here



# ----------------------------------------
# TEST DATA (Auto Insert if Empty)
# ----------------------------------------

    conn = get_connection()
    cursor = conn.cursor()

    now = datetime.now(timezone.utc).isoformat()

    test_data = [
        (account_id, "hash1", now, now, "yield", 80, "evaluated", "correct", 85, 1, 85),
        (account_id, "hash2", now, now, "disease", 70, "evaluated", "correct", 90, 1, 90),
        (account_id, "hash3", now, now, "rainfall", 60, "evaluated", "partial", 65, 1, 65),
        (account_id, "hash4", now, now, "pest", 75, "evaluated", "wrong", 40, 1, 40),
    ]

    cursor.executemany("""
        INSERT INTO prediction_history (
            account_id,
            advisory_hash,
            issued_at,
            valid_until,
            prediction_type,
            confidence_level,
            evaluation_status,
            actual_outcome,
            accuracy_score,
            impact_weight,
            final_score
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, test_data)

    conn.commit()
    conn.close()


# ----------------------------------------
# TRUST SCORE COMPUTATION
# ----------------------------------------

def compute_trust_score(account_id: str) -> dict:
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT accuracy_score, impact_weight, issued_at
        FROM prediction_history
        WHERE account_id = ?
        AND evaluation_status = 'evaluated'
    """, (account_id,))

    rows = cursor.fetchall()

    # Auto insert test data if empty
    if not rows:
        compute_trust_score(account_id)
        return compute_trust_score(account_id)

    accuracies = []
    weighted_scores = []

    for accuracy, weight, issued_at in rows:
        if accuracy is None:
            continue

        weight = weight or 1
        weighted_scores.append(accuracy * weight)
        accuracies.append(accuracy)

    if not accuracies:
        conn.close()
        return {
            "account_id": account_id,
            "trust_score": BASELINE_SCORE,
            "reason": "no_valid_evaluations"
        }

    # ----------------------------------------
    # A = Average Weighted Accuracy
    # ----------------------------------------

    A = mean(weighted_scores)

    # ----------------------------------------
    # C = Consistency (lower variance better)
    # ----------------------------------------

    if len(accuracies) > 1:
        variance = pstdev(accuracies)
        C = max(0, 100 - variance)
    else:
        C = 70

    # ----------------------------------------
    # V = Volume Factor
    # ----------------------------------------

    volume = len(accuracies)

    if volume >= 20:
        V = 100
    elif volume >= 10:
        V = 80
    elif volume >= 5:
        V = 65
    else:
        V = 50

    # ----------------------------------------
    # R = Recency Factor
    # ----------------------------------------

    now = datetime.now(timezone.utc)
    recent_count = 0

    for _, _, issued_at in rows:
        issued_dt = datetime.fromisoformat(issued_at)
        days_old = (now - issued_dt).days

        if days_old <= 30:
            recent_count += 1

    if recent_count >= 5:
        R = 100
    elif recent_count >= 2:
        R = 80
    else:
        R = 60

    # ----------------------------------------
    # FINAL DETERMINISTIC FORMULA
    # ----------------------------------------

    trust_score = (
        (0.5 * A) +
        (0.2 * C) +
        (0.2 * R) +
        (0.1 * V)
    )

    trust_score = max(0, min(100, round(trust_score, 2)))

    conn.close()

    return {
        "account_id": account_id,
        "trust_score": trust_score,
        "components": {
            "average_accuracy": round(A, 2),
            "consistency": round(C, 2),
            "volume_factor": V,
            "recency_factor": R
        }
    }
