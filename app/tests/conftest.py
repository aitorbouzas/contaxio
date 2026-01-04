import sys
import os
import pytest
from unittest.mock import patch, AsyncMock, MagicMock
from fastapi.testclient import TestClient
from mongomock_motor import AsyncMongoMockClient

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
from dependencies import mqtt_app, ws_manager

@pytest.fixture
def mock_mongo():
    client = AsyncMongoMockClient()
    return client.contaxio

@pytest.fixture
def mock_mqtt():
    with patch.object(mqtt_app.client, 'connect', new_callable=AsyncMock) as mock_connect:
        with patch.object(mqtt_app.client, 'publish', new_callable=AsyncMock) as mock_publish:
            with patch.object(mqtt_app.client, 'subscribe', new_callable=MagicMock) as mock_subscribe:
                yield {
                    "connect": mock_connect,
                    "publish": mock_publish,
                    "subscribe": mock_subscribe
                }

@pytest.fixture
def mock_ws():
    """
    Intercepta la función 'broadcast' del manager real.
    """
    with patch.object(ws_manager, 'broadcast', new_callable=AsyncMock) as mock_broadcast:
        yield mock_broadcast

@pytest.fixture(autouse=True)
def patch_dependencies(mock_mongo, mock_mqtt, mock_ws):
    with patch("routers.games.games_db", mock_mongo.games):
        yield

@pytest.fixture
def client(mock_mqtt):
    with TestClient(app) as test_client:
        yield test_client