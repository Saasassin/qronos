from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.testclient import TestClient
from qronos.app import app
from qronos.db import create_db_and_tables


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app.router.lifespan_context = lifespan


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
