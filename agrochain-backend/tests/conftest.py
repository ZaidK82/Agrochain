import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def sample_prediction_request():
    return {
        "crop": "Rice",
        "district_uid": "MH::Pune",
        "year": 2024,
        "season": "Kharif"
    }
