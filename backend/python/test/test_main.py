from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine

from main import app, get_session

def test_create_user():
    with TestClient(app) as client:
        response = client.post(
            "/user",
            json={"email": "bob@bob.com", "password": "secret"},
        )
        assert response.status_code == 200, response.text
        data = response.json()
        assert data["email"] == "bob@bob.com"
        assert "id" in data 
        assert "created_at" in data
        assert "updated_at" in data