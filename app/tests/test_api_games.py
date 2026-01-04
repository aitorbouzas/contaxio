def test_create_game_flow(client):
    payload = {
        "players": 4,
        "impostors": 1
    }

    response = client.post("/games/create", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["config"]["total_players"] == 4
    assert "cortocircuito" in data["puzzles"]

    game_id = data["game_id"]

    response = client.get("/games/current")
    assert response.status_code == 200
    assert response.json()["game_id"] == game_id


def test_stop_game(client):
    client.post("/games/create", json={"players": 2, "impostors": 0})

    response = client.post("/games/stop")
    assert response.status_code == 200

    response = client.get("/games/current")
    assert response.status_code == 200
