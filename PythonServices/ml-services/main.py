from pathlib import Path
from typing import Literal, Optional, Union
from symptom_analyzer.analyzer import analyzer
import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from symptom_analyzer.rules import classify_by_rules
from disease_config import get_disease_config, get_question_order
from session_store import create_session, get_session, update_session, delete_session

app = FastAPI(title="MediScan Multi-Disease API", version="2.0.0")

# =========================================================
# MODEL PATHS & LOADING (FIXED)
# =========================================================

# 1. Diabetes Complete
DIABETES_COMPLETE_PATH = Path("models/diabetes_model.pkl")
if not DIABETES_COMPLETE_PATH.exists(): raise FileNotFoundError("Missing diabetes_model.pkl")
diabetes_complete_model = joblib.load(DIABETES_COMPLETE_PATH)

# 2. Diabetes Basic
DIABETES_BASIC_PATH = Path("models/diabetes_basic_model.pkl")
if not DIABETES_BASIC_PATH.exists(): raise FileNotFoundError("Missing diabetes_basic_model.pkl")
diabetes_basic_model = joblib.load(DIABETES_BASIC_PATH)

# 3. Heart Complete
HEART_MODEL_PATH = Path("models/heart_model.pkl")
if not HEART_MODEL_PATH.exists(): raise FileNotFoundError("Missing heart_model.pkl")
heart_model = joblib.load(HEART_MODEL_PATH)

print("✅ All ML Models Loaded Successfully")

# =========================================================
# INPUT SCHEMAS
# =========================================================

class DiabetesInput(BaseModel):
    gender: Literal["Female", "Male", "Other"]
    age: float = Field(..., ge=0, le=80)
    hypertension: Literal[0, 1]
    heart_disease: Literal[0, 1]
    smoking_history: Literal["never", "No Info", "current", "former", "ever", "not current"]
    bmi: float = Field(..., gt=0, le=100)
    HbA1c_level: float = Field(..., gt=0, le=20)
    blood_glucose_level: int = Field(..., gt=0, le=500)

class BasicDiabetesInput(BaseModel):
    gender: Literal["Female", "Male", "Other"]
    age: float = Field(..., ge=0, le=120)
    hypertension: Literal[0, 1]
    heart_disease: Literal[0, 1]
    smoking_history: Literal["never", "No Info", "current", "former", "ever", "not current"]
    bmi: float = Field(..., gt=0, le=100)

class HeartInput(BaseModel):
    Age: int
    Sex: Literal["M", "F"]
    ChestPainType: Literal["ATA", "NAP", "ASY", "TA"]
    RestingBP: float
    Cholesterol: float
    FastingBS: Literal[0, 1]
    RestingECG: Literal["Normal", "ST", "LVH"]
    MaxHR: float
    ExerciseAngina: Literal["N", "Y"]
    Oldpeak: float
    ST_Slope: Literal["Up", "Flat", "Down"]

class ScreenRequest(BaseModel):
    session_id: Optional[str] = None
    message: Optional[str] = None
    feature_value: Optional[Union[int, float, str]] = None
    mode: Optional[str] = None

# =========================================================
# PREDICTION FUNCTIONS
# =========================================================

def get_risk_level(probability: float) -> str:
    if probability < 0.30: return "Low"
    elif probability < 0.60: return "Moderate"
    return "High"

BASIC_THRESHOLD = 0.70
def get_basic_risk_level(probability: float) -> str:
    if probability < 0.40: return "Low"
    elif probability < BASIC_THRESHOLD: return "Moderate"
    return "High"

@app.post("/predict/diabetes")
def predict_diabetes(data: DiabetesInput):
    try:
        df = pd.DataFrame([data.model_dump()])
        prob = float(diabetes_complete_model.predict_proba(df)[0][1])
        return {"disease": "Diabetes", "mode": "complete", "prediction": int(prob >= 0.5), "probability": round(prob, 4), "riskLevel": get_risk_level(prob), "modelName": "Random Forest", "modelVersion": "1.0"}
    except Exception as e: raise HTTPException(500, str(e))

@app.post("/predict/diabetes/basic")
def predict_basic_diabetes(data: BasicDiabetesInput):
    try:
        df = pd.DataFrame([data.model_dump()])
        prob = float(diabetes_basic_model.predict_proba(df)[0][1])
        return {"disease": "Diabetes", "mode": "basic", "prediction": int(prob >= BASIC_THRESHOLD), "probability": round(prob, 4), "riskLevel": get_basic_risk_level(prob), "modelName": "Random Forest", "modelVersion": "1.0-basic"}
    except Exception as e: raise HTTPException(500, str(e))

@app.post("/predict/heart")
def predict_heart(data: HeartInput):
    try:
        # Use model_dump() to get the exact column names from the Pydantic model
        df = pd.DataFrame([data.model_dump()])
        
        prob = float(heart_model.predict_proba(df)[0][1])
        
        return {
            "disease": "Heart Disease", 
            "mode": "complete", 
            "prediction": int(prob >= 0.5), 
            "probability": round(prob, 4), 
            "riskLevel": get_risk_level(prob), 
            "modelName": "Random Forest", 
            "modelVersion": "2.0"
        }
    except Exception as e: 
        raise HTTPException(500, str(e))

# =========================================================
# SCREENING ENGINE (GENERIC ROUTER)
# =========================================================

def normalize_feature(field: str, value):
    if field == "gender" or field == "sex":
        v = str(value).strip().lower()
        if v in ("female", "f", "0"): return "Female" if field == "gender" else 0
        if v in ("male", "m", "1"): return "Male" if field == "gender" else 1
        return "Other" if field == "gender" else 0
    if field == "smoking_history":
        v = str(value).strip().lower()
        return {"no": "never", "yes": "current", "quit": "former"}.get(v, v)
    if field in ("hypertension", "heart_disease", "fbs", "exang"):
        v = str(value).strip().lower()
        return 1 if v in ("yes", "y", "1", "true") else 0
    return value

def _cast_feature(value, field_type: str):
    if field_type == "int": return int(value)
    if field_type == "float": return float(value)
    return str(value)

def _next_question(session):
    disease = session["candidate_diseases"][0]
    mode = session["mode"]
    config = get_disease_config(disease)[mode]
    for field in config["required_features"]:
        if field not in session["collected_features"]:
            return field, config["questions"][field]
    return None, None

@app.post("/screen")
def screen(data: ScreenRequest):
    # Start new session
    if not data.session_id:
        if not data.message: raise HTTPException(400, "First call requires message.")
        
        rule_result = classify_by_rules(data.message)
        category = rule_result["category"]

        if category == "none":
            return {"session_id": None, "status": "no_match", "message": "No matching condition found."}

        session_id = create_session()
        mode = data.mode or "basic"

        update_session(session_id, symptoms_text=data.message, candidate_diseases=[category], mode=mode, status="collecting")
        session = get_session(session_id)
        next_field, question = _next_question(session)
        update_session(session_id, pending_feature=next_field)

        return {
            "session_id": session_id, "status": "collecting", "candidate_diseases": [category], "mode": mode,
            "next_field": next_field, "next_question": question, "symptoms_text": session.get("symptoms_text", ""),
            "collected_features": session["collected_features"], "progress": f"0/{len(get_disease_config(category)[mode]['required_features'])}",
        }

    # Continue session
    session = get_session(data.session_id)
    if not session: raise HTTPException(404, "Session expired.")
    if session["status"] == "complete": return {"session_id": data.session_id, "status": "already_complete"}

    pending = session["pending_feature"]
    if pending and data.feature_value is not None:
        disease = session["candidate_diseases"][0]
        mode = session["mode"]
        field_type = get_disease_config(disease)[mode]["field_types"][pending]
        
        normalized = normalize_feature(pending, data.feature_value)
        casted = _cast_feature(normalized, field_type)
        
        features = dict(session["collected_features"])
        features[pending] = casted
        update_session(data.session_id, collected_features=features, pending_feature=None)

    session = get_session(data.session_id)
    next_field, question = _next_question(session)

    if next_field:
        update_session(data.session_id, pending_feature=next_field)
        total = len(get_disease_config(session["candidate_diseases"][0])[session["mode"]]["required_features"])
        done = len(session["collected_features"])
        return {
            "session_id": data.session_id, "status": "collecting", "next_field": next_field, "next_question": question,
            "symptoms_text": session.get("symptoms_text", ""), "collected_features": session["collected_features"], "progress": f"{done}/{total}",
        }

    # 🚨 GENERIC ROUTER 🚨
    disease = session["candidate_diseases"][0]
    mode = session["mode"]
    features = session["collected_features"]

    try:
        if disease == "diabetes" and mode == "basic":
            payload = BasicDiabetesInput(**features)
            result = predict_basic_diabetes(payload)
        elif disease == "diabetes" and mode == "complete":
            payload = DiabetesInput(**features)
            result = predict_diabetes(payload)
        elif disease == "heart_disease":
            payload = HeartInput(**features)
            result = predict_heart(payload)
        else:
            raise HTTPException(500, f"Unknown disease/mode: {disease}/{mode}")

    except Exception as e:
        raise HTTPException(500, f"Prediction failed: {str(e)}")

    update_session(data.session_id, status="complete")
    return {"session_id": data.session_id, "status": "complete", "disease": disease, "mode": mode, "symptoms_text": session.get("symptoms_text", ""), "result": result}