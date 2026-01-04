import json


def test_create_game_flow(client, mock_ws):
    payload = {
        "players": 4,
        "impostors": 1
    }

    response = client.post("/games/create", json=payload)
    assert response.status_code == 200
    data = response.json()

    mock_ws.assert_called_once()

    call_args = mock_ws.call_args[0][0]
    ws_message = json.loads(call_args)

    assert ws_message["type"] == "GAME_STATE_UPDATE"
    assert ws_message["payload"]["active"] == True
    assert ws_message["payload"]["config"]["total_players"] == 4

    assert data["config"]["total_players"] == 4
    assert "cortocircuito" in data["puzzles"]

    game_id = data["game_id"]

    response = client.get("/games/current")
    assert response.status_code == 200
    assert response.json()["game_id"] == game_id


def test_stop_game(client, mock_ws):
    client.post("/games/create", json={"players": 2, "impostors": 0})

    mock_ws.reset_mock()

    response = client.post("/games/stop")
    assert response.status_code == 200

    mock_ws.assert_called_once()

    call_args = mock_ws.call_args[0][0]
    ws_message = json.loads(call_args)

    assert ws_message["type"] == "GAME_STATE_UPDATE"
    assert ws_message["payload"]["active"] == False