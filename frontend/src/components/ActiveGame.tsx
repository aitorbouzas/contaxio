// src/components/ActiveGame.tsx
import {Game} from "@/types/games";

interface Props {
  game: Game;
  onStop: () => void;
}

export function ActiveGame({ game, onStop }: Props) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow">
        <div>
          <h2 className="text-xl font-bold text-green-600 animate-pulse">● JUEGO EN CURSO</h2>
          <p className="text-sm text-gray-500">ID: {game.game_id.slice(0, 8)}...</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-mono font-bold">{game.duration_seconds}s</p>
          <button
            onClick={onStop}
            className="mt-2 bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 text-sm font-bold border border-red-200"
          >
            ABORTAR MISIÓN
          </button>
        </div>
      </div>

      {/* Grid de Puzzles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(game.puzzles).map(([key, puzzle]) => (
          <div key={key} className={`p-4 rounded-lg border-2 ${
            puzzle.status === 'SOLVED' ? 'border-green-500 bg-green-50' : 
            puzzle.status === 'FAILED' ? 'border-red-500 bg-red-50' :
            puzzle.status === 'SABOTAGED' ? 'border-purple-500 bg-purple-50' :
            'border-gray-200 bg-white'
          }`}>
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-lg">{puzzle.display_name}</h3>
              <span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${
                 puzzle.status === 'SOLVED' ? 'bg-green-500' : 
                 puzzle.status === 'FAILED' ? 'bg-red-500' :
                 puzzle.status === 'SABOTAGED' ? 'bg-purple-500' :
                 'bg-gray-400'
              }`}>
                {puzzle.status}
              </span>
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-600">Intentos: {puzzle.tries.length}</p>
              {puzzle.tries.length > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  Último: {puzzle.tries[puzzle.tries.length - 1].outcome}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lista de Jugadores (Debug) */}
      <div className="bg-gray-50 p-4 rounded text-xs font-mono text-gray-500">
        Configuración: {game.config.total_players} Jugadores / {game.config.total_impostors} Impostores
      </div>
    </div>
  );
}