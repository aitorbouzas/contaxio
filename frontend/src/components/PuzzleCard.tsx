// src/components/PuzzleCard.tsx
import { Puzzle } from "@/types/games";
import {LiveTimer} from "@/components/LiveTimer";

export function PuzzleCard({ puzzle }: { puzzle: Puzzle }) {
  const activeTry = puzzle.status === "ACTIVE" && puzzle.tries.length > 0
    ? puzzle.tries[puzzle.tries.length - 1]
    : null;

  const getStatusColor = () => {
    switch (puzzle.status) {
      case "SOLVED": return "border-green-500 bg-green-50";
      case "INACTIVE": return "border-teal-500 bg-teal-50";
      case "SABOTAGED": return "border-red-500 bg-red-50";
      case "ACTIVE": return "border-blue-500 bg-white ring-2 ring-blue-200";
      default: return "border-gray-200 bg-white";
    }
  };

  const getBadgeColor = () => {
    switch (puzzle.status) {
      case "SOLVED": return "bg-green-600";
      case "INACTIVE": return "bg-teal-600";
      case "SABOTAGED": return "bg-red-600";
      case "ACTIVE": return "bg-blue-600 animate-pulse";
      default: return "bg-gray-400";
    }
  };

  return (
    <div className={`p-4 rounded-lg border-2 transition-all duration-300 ${getStatusColor()}`}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-lg text-gray-800">{puzzle.display_name}</h3>
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
          {puzzle.tries.length > 0 && puzzle.status !== "ACTIVE" && (
            <p className="text-xs text-gray-400">
              Último resultado: <span className="font-medium">{puzzle.tries[puzzle.tries.length - 1].outcome}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}