// src/components/CreateGameForm.tsx
import { useState } from "react";

interface Props {
  onCreate: (p: number, i: number) => void;
}

export function CreateGameForm({ onCreate }: Props) {
  const [players, setPlayers] = useState(4);
  const [impostors, setImpostors] = useState(1);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Nueva Partida</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Jugadores</label>
          <input
            type="number"
            value={players}
            onChange={(e) => setPlayers(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Impostores</label>
          <input
            type="number"
            value={impostors}
            onChange={(e) => setImpostors(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          />
        </div>

        <button
          onClick={() => onCreate(players, impostors)}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Iniciar Misión
        </button>
      </div>
    </div>
  );
}