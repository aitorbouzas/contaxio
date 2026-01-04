import json

from config import MQTT_TOPICS, LOGS_TOPIC
from dependencies import mqtt_app, logs_db, ws_manager
from models import LogEntry

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

        # if message == PuzzleStatus.SOLVED:
        #     asyncio.run_coroutine_threadsafe(
        #         ws_manager.broadcast({"topic": topic, "status": PuzzleStatus.SOLVED}), loop
        #     )
