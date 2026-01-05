// src/components/ActiveGame.tsx
import { Game } from "@/types/games";
import { LiveTimer } from "@/components/LiveTimer";
import { PuzzleCard } from "@/components/PuzzleCard";

interface Props {
  game: Game;
  onStop: () => void;
  onControlPuzzle: (key: string, action: string) => void;
}

export function ActiveGame({ game, onStop, onControlPuzzle }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="mb-4 md:mb-0">
          <div className="flex items-center space-x-3">
            <span className="relative flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
            </span>
            <h2 className="text-2xl font-bold text-gray-800">Misión en Curso</h2>
          </div>
          <p className="text-sm text-gray-500 mt-1 font-mono">ID: {game.game_id.slice(0, 8)}</p>
        </div>

        <div className="text-center md:text-right">
          <div className="text-5xl font-mono font-bold text-gray-900 tracking-tighter">
            <LiveTimer startTime={game.start_time} />
          </div>
          <div className="mt-3">
            <button
              onClick={onStop}
              className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
            >
              TERMINAR PARTIDA
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(game.puzzles).map(([key, puzzle]) => (
          <PuzzleCard
            key={key}
            puzzleKey={key}
            puzzle={puzzle}
            onControl={onControlPuzzle}
          />
        ))}
      </div>

      <div className="bg-gray-100 border border-gray-200 p-3 rounded-lg text-center">
        <p className="text-xs text-gray-500 font-mono">
          CONFIG: {game.config.total_players} JUGADORES | {game.config.total_impostors} IMPOSTORES | DIFICULTAD {game.config.difficulty}
        </p>
      </div>
    </div>
  );
}