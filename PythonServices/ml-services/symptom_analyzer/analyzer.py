from transformers import pipeline
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model")

SYSTEM_PROMPT = (
    "You are a symptom router for a health education tool. "
    "Map symptoms to one of: diabetes, heart_disease, kidney_disease, none. "
    "Reply ONLY with the category name."
)


class SymptomAnalyzer:
    def __init__(self):
        print("🔄 Loading symptom analyzer model...")
        self.pipe = pipeline(
            "text-generation",
            model=MODEL_PATH,
            tokenizer=MODEL_PATH,
        )
        print("✅ Symptom analyzer loaded")

    def analyze(self, user_text: str) -> str:
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_text},
        ]

        result = self.pipe(
            messages,
            max_new_tokens=10,
            do_sample=False,
        )

        output = result[0]["generated_text"]

        # ✅ THE FIX: if it's a list of messages, take the LAST one
        if isinstance(output, list):
            return output[-1]["content"].strip().lower()

        # Fallback: if it's a string, return as-is
        return str(output).strip().lower()


analyzer = SymptomAnalyzer()