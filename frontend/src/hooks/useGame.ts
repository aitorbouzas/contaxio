// src/hooks/useGame.ts
"use client";

import { useEffect, useState, useRef } from "react";
import { Game } from "@/types/game";

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
      console.log("✅ WS Conectado");
      setIsConnected(true);
    };

    ws.current.onclose = () => {
      console.log("❌ WS Desconectado");
      setIsConnected(false);
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "GAME_STATE_UPDATE") {
          console.log("🔄 Actualización recibida:", data.payload);
          setGame(data.payload);
        }
      } catch (e) {
        console.error("Error parseando WS:", e);
      }
    };

    return () => {
      ws.current?.close();
    };
  }, []);

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