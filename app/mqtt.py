import json

from config import MQTT_TOPICS, LOGS_TOPIC, CMD_SUBTOPIC
from dependencies import mqtt_app, logs_db, ws_manager, games_db
from models import LogEntry, Game, Player


async def broadcast_game_state(game: Game):
    """Envía el estado completo del juego a todos los clientes conectados"""
    await ws_manager.broadcast(json.dumps({
        "type": "GAME_STATE_UPDATE",
        "payload": json.loads(game.model_dump_json())
    }))

def register_mqtt_handlers():
    @mqtt_app.on_connect()
    def on_connect(client, flags, rc, properties):
        for topic in MQTT_TOPICS:
            print(f"Subscribing to {topic}")
            mqtt_app.client.subscribe(topic)


    @mqtt_app.on_message()
    async def on_message(client, topic, payload, qos, properties):
        message = payload.decode()
        ws_data = {
            "type": "mqtt_message",
            "topic": topic,
            "payload": message
        }
        await ws_manager.broadcast(json.dumps(ws_data))

        if topic == LOGS_TOPIC:
            logs_db.insert_one(
                LogEntry(
                    source=client,
                    message=message,
                )
            )

        if topic.endswith("/rfid"):
            uid = message.strip()
            lobby_game = await games_db.find_one({"status": "LOBBY"})

            if lobby_game:
                players_list = lobby_game.get("players", [])
                player_exists = any(p["uid"] == uid for p in players_list)

                if not player_exists:
                    new_player = Player(uid=uid)
                    await games_db.update_one(
                        {"_id": lobby_game["_id"]},
                        {"$push": {"players": new_player.model_dump()}}
                    )

                    updated_game_data = await games_db.find_one({"_id": lobby_game["_id"]})
                    updated_game = Game(**updated_game_data)

                    await broadcast_game_state(updated_game)

        # Recuperar estado de un dispositivo que se acaba de iniciar
        if topic.endswith("/request") and message == "HELLO":
            puzzle_topic = topic.replace("/request", "")
            active_game_data = await games_db.find_one({"status": {"$in": ["LOBBY", "RUNNING"]}})

            if active_game_data:
                game = Game(**active_game_data)
                target_puzzle = None
                for p in game.puzzles.values():
                    if p.topic == puzzle_topic:
                        target_puzzle = p
                        break

                if target_puzzle:
                    cmd_topic = f"{puzzle_topic}/{CMD_SUBTOPIC}"
                    mqtt_app.client.publish(cmd_topic, target_puzzle.status.value)
            else:
                mqtt_app.client.publish(f"{puzzle_topic}/{CMD_SUBTOPIC}", "INACTIVE")

class MQTTHandler:
    @staticmethod
    def command_all_puzzles(game: Game, command: str):
        for puzzle in game.puzzles.values():
            topic = f"{puzzle.topic}/{CMD_SUBTOPIC}"
            mqtt_app.client.publish(topic, command)
