from motor.motor_asyncio import AsyncIOMotorClient
from fastapi_mqtt import FastMQTT, MQTTConfig
from config import MONGO_URL, MQTT_BROKER, MQTT_PORT
from websocket import WebSocketConnectionManager

client = AsyncIOMotorClient(MONGO_URL)
db = client.contaxio
logs_db = db.logs
games_db = db.games

mqtt_config = MQTTConfig(
    host=MQTT_BROKER,
    port=MQTT_PORT
)
mqtt_app = FastMQTT(config=mqtt_config)

ws_manager = WebSocketConnectionManager()