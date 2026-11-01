"""
Rule-based symptom classifier.
Single-word keywords + phrase keywords for flexible matching.
"""

KEYWORD_RULES = {
    "diabetes": {
        "excessive thirst": 3,
        "always thirsty": 3,
        "frequent urination": 3,
        "urinating frequently": 3,
        "high sugar": 3,
        "high glucose": 3,
        "blurred vision": 2,
        "slow healing": 2,
        "weight loss": 2,
        "thirsty": 2,
        "thirst": 2,
        "urinating": 2,
        "urination": 2,
        "peeing": 2,
        "sugar": 2,
        "glucose": 2,
        "tired": 1,
        "fatigue": 1,
    },
    "heart_disease": {
        "chest pain": 3,
        "chest tightness": 3,
        "chest pressure": 3,
        "shortness of breath": 3,
        "pain in left arm": 3,
        "heart racing": 2,
        "palpitations": 2,
        "breathless": 3,
        "chest": 2,
        "heart": 1,
        "dizzy": 1,
        "fatigue": 1,
    },
    "kidney_disease": {
        "foamy urine": 3,
        "frothy urine": 3,
        "blood in urine": 3,
        "swollen legs": 3,
        "swollen ankles": 3,
        "swollen feet": 3,
        "decreased urination": 2,
        "puffy eyes": 2,
        "kidney pain": 3,
        # ✅ Single-word keywords — these catch reversed phrasing
        "foamy": 2,
        "frothy": 2,
        "swollen": 2,
        "swelling": 2,
        "urine": 1,
        "kidney": 2,
        "nausea": 1,
        "fatigue": 1,
    },
}

MIN_SCORE = 3


def classify_by_rules(text: str) -> dict:
    text_lower = text.lower()

    scores = {}
    matches = {}

    for category, keywords in KEYWORD_RULES.items():
        score = 0
        hit = []
        for keyword, weight in keywords.items():
            if keyword in text_lower:
                score += weight
                hit.append(keyword)
        scores[category] = score
        matches[category] = hit

    if not scores or max(scores.values()) < MIN_SCORE:
        return {
            "category": "none",
            "confidence": 0.0,
            "matches": matches,
        }

    best_category = max(scores, key=scores.get)
    best_score = scores[best_category]
    confidence = min(best_score / 6.0, 1.0)

    return {
        "category": best_category,
        "confidence": round(confidence, 2),
        "matches": matches,
    }