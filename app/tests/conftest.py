import sys
import os
import pytest
from unittest.mock import patch, AsyncMock, MagicMock
from fastapi.testclient import TestClient
from mongomock_motor import AsyncMongoMockClient

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app

@pytest.fixture
def mock_mongo():
    client = AsyncMongoMockClient()
    return client.contaxio

@pytest.fixture
def mock_mqtt():
    with patch("main.mqtt_app") as mock:
        mock.client.connect = AsyncMock()
        mock.client.publish = AsyncMock()
        mock.client.subscribe = MagicMock()
        yield mock

@pytest.fixture(autouse=True)
def patch_dependencies(mock_mongo, mock_mqtt):
    """
    Reemplaza la DB real y el MQTT real por los mocks en cada test.
    """
    with patch("routers.games.games_db", mock_mongo.games):
        yield

@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client