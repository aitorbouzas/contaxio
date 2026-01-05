import os
from enum import Enum

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
MQTT_BROKER = os.getenv("MQTT_BROKER", "mqtt")
MQTT_PORT = os.getenv("MQTT_PORT", 1883)
LOGS_TOPIC = "sala/logs"
PUZZLES_TOPIC = "sala/puzzles"
CMD_SUBTOPIC = "cmd"
MQTT_TOPICS = [LOGS_TOPIC, f"{PUZZLES_TOPIC}/#"]
PUZZLES = ["cortocircuito"]
