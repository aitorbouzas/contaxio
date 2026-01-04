// src/hooks/useGame.ts
"use client";

import { useEffect, useState, useRef } from "react";
import { Game, PuzzleStatus } from "@/types/games";

const BACKEND_URL = "http://localhost:8000";
const WS_URL = "ws://localhost:8000/ws";

export function useGame() {
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);

  const fetchCurrentGame = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/games/current`);
      if (res.ok) {
        const data = await res.json();
        setGame(data);
        // Pedir status al iniciar para sincronizar
        await fetch(`${BACKEND_URL}/games/refresh-status`, { method: "POST" });
      }
    } catch (error) {
      console.error("Error fetching game:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentGame();

    ws.current = new WebSocket(WS_URL);

    ws.current.onopen = () => {
      setIsConnected(true);
    };

    ws.current.onclose = () => {
      setIsConnected(false);
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "GAME_STATE_UPDATE") {
          setGame(data.payload);
        }
        if (data.type === "mqtt_message") {
          handleMqttMessage(data.topic, data.payload);
        }
      } catch (e) {
        console.error("Error parsing WS:", e);
      }
    };

    return () => {
      ws.current?.close();
    };
  }, []);

  const handleMqttMessage = (topic: string, payload: string) => {
    setGame((prevGame) => {
      if (!prevGame) return null;

      const newPuzzles = { ...prevGame.puzzles };
      let hasChanges = false;

      for (const [key, puzzle] of Object.entries(newPuzzles)) {
        if (topic === `${puzzle.topic}/status`) {
          let newStatus: PuzzleStatus = puzzle.status;

          if (payload === "ACTIVE") newStatus = "ACTIVE";
          else if (payload === "INACTIVE") newStatus = "INACTIVE";
          else if (payload === "STARTING_GAME") newStatus = "STARTING_GAME";
          else if (payload === "SABOTAGED") newStatus = "SABOTAGED";
          else if (payload === "SOLVED") newStatus = "SOLVED";
          else if (payload === "IDLE") newStatus = "IDLE";

          if (newStatus !== puzzle.status) {
            newPuzzles[key] = {
              ...puzzle,
              status: newStatus
            };
            hasChanges = true;
          }
        }
      }

      if (!hasChanges) return prevGame;

      return {
        ...prevGame,
        puzzles: newPuzzles
      };
    });
  };

  // ... createGame y stopGame se quedan igual ...
  const createGame = async (players: number, impostors: number) => {
    const res = await fetch(`${BACKEND_URL}/games/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ players, impostors }),
    });
    return res.ok;
  };

  const stopGame = async () => {
    await fetch(`${BACKEND_URL}/games/stop`, { method: "POST" });
  };

  const isActive = game !== null && game.end_time === null;

  return {
    game,
    loading,
    isConnected,
    isActive,
    createGame,
    stopGame,
  };
}