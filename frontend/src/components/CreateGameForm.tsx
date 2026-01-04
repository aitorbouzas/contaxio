// src/components/CreateGameForm.tsx
import { useState, useEffect } from "react";
import { Game } from "@/types/games";

interface Props {
  game: Game | null; // El juego actual (Lobby)
  onCreateLobby: () => void;
  onStartGame: (impostors: number) => void;
  onCancel: () => void;
}

export function CreateGameForm({ game, onCreateLobby, onStartGame, onCancel }: Props) {
  const [impostors, setImpostors] = useState(1);

  if (!game) {
    return (
      <div className="text-center py-10">
        <button
          onClick={onCreateLobby}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-full shadow-lg text-xl transition-transform hover:scale-105"
        >
          ABRIR SALA DE CONTROL
        </button>
      </div>
    );
  }

  if (game.status === "LOBBY") {
    return (
      <div className="bg-white p-8 rounded-xl shadow-xl max-w-2xl mx-auto border border-gray-200">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-800 animate-pulse">ESPERANDO AGENTES...</h2>
          <p className="text-gray-500 mt-2">Escanead vuestras tarjetas RFID en los módulos.</p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-end mb-2">
            <h3 className="text-lg font-semibold text-gray-700">Agentes Conectados</h3>
            <span className="text-2xl font-bold text-indigo-600">{game.players.length}</span>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 min-h-[150px] border border-gray-200 grid grid-cols-2 gap-2">
            {game.players.length === 0 ? (
              <p className="col-span-2 text-center text-gray-400 italic py-10">Esperando escaneo...</p>
            ) : (
              game.players.map((p) => (
                <div key={p.uid} className="flex items-center bg-white p-3 rounded shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-2">
                  <div className="h-3 w-3 rounded-full bg-green-500 mr-3"></div>
                  <span className="font-mono text-gray-700">{p.uid}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-indigo-50 p-6 rounded-lg mb-8">
          <label className="block text-sm font-bold text-indigo-900 mb-2">
            Número de Impostores
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="1"
              max={Math.max(1, game.players.length - 1)}
              value={impostors}
              onChange={(e) => setImpostors(Number(e.target.value))}
              className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-3xl font-bold text-indigo-700 w-12 text-center">{impostors}</span>
          </div>
          <p className="text-xs text-indigo-400 mt-2">
            Max: {Math.max(1, game.players.length - 1)} (Se necesita al menos 1 tripulante)
          </p>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-6 border border-red-300 text-red-600 rounded-lg font-bold hover:bg-red-50 transition-colors"
          >
            CANCELAR OPERACIÓN
          </button>
          <button
            onClick={() => onStartGame(impostors)}
            disabled={game.players.length < 4}
            className={`flex-1 py-3 px-6 text-white rounded-lg font-bold shadow-md transition-all ${
              game.players.length < 4
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-green-600 hover:bg-green-700 hover:shadow-lg transform hover:-translate-y-1"
            }`}
          >
            INICIAR MISIÓN
          </button>
        </div>
      </div>
    );
  }

  return null;
}