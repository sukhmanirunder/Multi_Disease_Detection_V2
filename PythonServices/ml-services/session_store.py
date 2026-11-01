"""
In-memory session store.
Keeps track of each user's symptom-analysis + feature-collection progress.

For a student project, an in-memory dict is fine.
For production, swap this for Redis or MongoDB.
"""

import uuid
from datetime import datetime, timedelta

# session_id -> session dict
_sessions = {}

# Auto-expire sessions after 30 minutes of inactivity
SESSION_TIMEOUT = timedelta(minutes=30)


def create_session():
    session_id = str(uuid.uuid4())
    _sessions[session_id] = {
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "symptoms_text": "",
        "candidate_diseases": [],
        "mode": None,
        "collected_features": {},
        "pending_feature": None,
        "question_index": 0,
        "status": "new",       # new → analyzing → collecting → complete
    }
    return session_id


def get_session(session_id: str):
    _cleanup_expired()
    return _sessions.get(session_id)


def update_session(session_id: str, **kwargs):
    session = _sessions.get(session_id)
    if not session:
        return None
    session.update(kwargs)
    session["updated_at"] = datetime.utcnow()
    return session


def delete_session(session_id: str):
    return _sessions.pop(session_id, None)


def _cleanup_expired():
    now = datetime.utcnow()
    expired = [
        sid for sid, s in _sessions.items()
        if now - s["updated_at"] > SESSION_TIMEOUT
    ]
    for sid in expired:
        _sessions.pop(sid, None)