"""
MediScan disease configuration.
Declares features, questions, endpoints, and mode-selection rules for each disease.

Adding a new disease = add a new entry to DISEASE_CONFIG. No other code changes.
"""

DISEASE_CONFIG = {
    "diabetes": {
        # -------- Basic Mode (default) — no lab values needed --------
      "basic": {
    "endpoint": "/predict/diabetes/basic",
    "model_name": "Random Forest (reduced features)",
    "model_version": "1.0-basic",
    "required_features": [
        "gender",
        "age",
        "hypertension",
        "heart_disease",
        "smoking_history",
        "bmi",
    ],
    "questions": {
        "gender": "What is your gender? (Female / Male / Other)",
        "age": "How old are you?",
        "hypertension": "Do you have hypertension? ",
        "heart_disease": "Do you have heart disease? ",
        "smoking_history": "Smoking history? (never / former / current / ever / not current / No Info)",
        "bmi": "What is your BMI?",
    },
    "field_types": {
        "gender": "str",
        "age": "float",
        "hypertension": "int",
        "heart_disease": "int",
        "smoking_history": "str",
        "bmi": "float",
    },
},

        # -------- Complete Mode (opt-in) — requires lab values --------
        "complete": {
            "endpoint": "/predict/diabetes",
            "model_name": "Random Forest (full features)",
            "model_version": "1.0",
            "required_features": [
                "gender",
                "age",
                "hypertension",
                "heart_disease",
                "smoking_history",
                "bmi",
                "HbA1c_level",
                "blood_glucose_level",
            ],
            "questions": {
                "gender": "What is your gender? (Female / Male / Other)",
                "age": "How old are you?",
                "hypertension": "Do you have hypertension? ",
                "heart_disease": "Do you have any heart disease?",
                "smoking_history": "Smoking history? (never / former / current / ever / not current / No Info)",
                "bmi": "What is your BMI?",
                "HbA1c_level": "What is your HbA1c level? (e.g. 6.5)",
                "blood_glucose_level": "What is your blood glucose level? (mg/dL)",
            },
            "field_types": {
                "gender": "str",
                "age": "float",
                "hypertension": "int",
                "heart_disease": "int",
                "smoking_history": "str",
                "bmi": "float",
                "HbA1c_level": "float",
                "blood_glucose_level": "int",
            },
        },
    },
}


def get_disease_config(disease: str):
    return DISEASE_CONFIG.get(disease)


def get_question_order(disease: str, mode: str):
    """Return the order in which we should ask for features."""
    config = DISEASE_CONFIG[disease][mode]
    return config["required_features"]