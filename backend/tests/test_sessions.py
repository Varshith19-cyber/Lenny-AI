import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_session_lifecycle():
    # 1. Create Session
    create_res = client.post("/api/v1/sessions", json={"title": "Test Strategy Session"})
    assert create_res.status_code == 201
    session_data = create_res.json()
    session_id = session_data["id"]
    assert session_data["title"] == "Test Strategy Session"

    # 2. Get Session
    get_res = client.get(f"/api/v1/sessions/{session_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == session_id

    # 3. Get Messages (should be empty initially)
    msgs_res = client.get(f"/api/v1/sessions/{session_id}/messages")
    assert msgs_res.status_code == 200
    assert isinstance(msgs_res.json(), list)

    # 4. Delete Session
    del_res = client.delete(f"/api/v1/sessions/{session_id}")
    assert del_res.status_code == 204
