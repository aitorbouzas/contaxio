// src/components/PuzzleCard.tsx
import { Puzzle, PuzzleStatus } from "@/types/games";
import { LiveTimer } from "@/components/LiveTimer";

export function PuzzleCard({ puzzleKey, puzzle, onControl }: { puzzleKey: string, puzzle: Puzzle, onControl: (key: string, action: string) => void }) {

  const activeTry = puzzle.status === PuzzleStatus.ACTIVE && puzzle.tries.length > 0
    ? puzzle.tries[puzzle.tries.length - 1]
    : null;

  const getStatusColor = () => {
    switch (puzzle.status) {
      case PuzzleStatus.SOLVED: return "border-green-500 bg-green-50";
      case PuzzleStatus.INACTIVE: return "border-teal-500 bg-teal-50";
      case PuzzleStatus.SABOTAGED: return "border-red-500 bg-red-50";
      case PuzzleStatus.ACTIVE: return "border-blue-500 bg-white ring-2 ring-blue-200";
      default: return "border-gray-200 bg-white";
    }
  };

  const getBadgeColor = () => {
    switch (puzzle.status) {
      case PuzzleStatus.SOLVED: return "bg-green-600";
      case PuzzleStatus.INACTIVE: return "bg-teal-600";
      case PuzzleStatus.SABOTAGED: return "bg-red-600";
      case PuzzleStatus.ACTIVE: return "bg-blue-600 animate-pulse";
      default: return "bg-gray-400";
    }
  };

  return (
    <div className={`p-4 rounded-lg border-2 transition-all duration-300 ${getStatusColor()} ${!puzzle.connected ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-lg text-gray-800">{puzzle.display_name}</h3>
          <span
            className={`h-3 w-3 rounded-full ${puzzle.connected ? 'bg-green-500' : 'bg-red-500'}`}
            title={puzzle.connected ? "Conectado" : "Desconectado"}
          />
        </div>
        <span className={`px-2 py-1 rounded text-xs font-bold text-white uppercase tracking-wider ${getBadgeColor()}`}>
          {puzzle.status}
        </span>
      </div>

      {activeTry ? (
        <div className="bg-blue-50 p-3 rounded-md border border-blue-100 mb-2">
          <div className="flex justify-between items-center text-blue-800">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-blue-400 uppercase">Jugador</span>
              <span className="font-mono font-bold text-sm">{activeTry.player_uid}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs font-semibold text-blue-400 uppercase">Tiempo</span>
              <span className="font-mono font-bold text-xl">
                <LiveTimer startTime={activeTry.started_at} />
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-2 space-y-1">
          <p className="text-sm text-gray-500">Intentos totales: <span className="font-semibold text-gray-700">{puzzle.tries.length}</span></p>
          {puzzle.tries.length > 0 && puzzle.status !== PuzzleStatus.ACTIVE && (
            <p className="text-xs text-gray-400">
              Último resultado: <span className="font-medium">{puzzle.tries[puzzle.tries.length - 1]?.outcome}</span>
            </p>
          )}
        </div>
      )}

      {/* PANEL DE CONTROL GM */}
      <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2">
        {puzzle.status !== PuzzleStatus.SABOTAGED && (
          <button
            disabled={!puzzle.connected}
            onClick={() => onControl(puzzleKey, "ACTIVE")}
            className="bg-green-100 hover:bg-green-200 text-green-700 text-xs font-bold py-2 px-2 rounded disabled:opacity-50"
          >
            ▶ ARRANCAR
          </button>
        )}

        {puzzle.status !== PuzzleStatus.SABOTAGED && (
          <button
            disabled={!puzzle.connected}
            onClick={() => onControl(puzzleKey, "SABOTAGED")}
            className="bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold py-2 px-2 rounded disabled:opacity-50"
          >
            🔥 SABOTEAR
          </button>
        )}

        {puzzle.status === PuzzleStatus.ACTIVE && (
           <button
             disabled={!puzzle.connected}
             onClick={() => onControl(puzzleKey, "IDLE")}
             className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-2 px-2 rounded col-span-2 disabled:opacity-50"
           >
             ⏸ PAUSAR (IDLE)
           </button>
        )}
      </div>
    </div>
  );
}