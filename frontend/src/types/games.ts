// src/types/game.ts

export type PuzzleStatus = "IN_PROGRESS" | "SOLVED" | "FAILED" | "SABOTAGED" | "IDLE";

export interface Try {
  try_id: string;
  player_uid: string;
  started_at: string;
  ended_at: string | null;
  outcome: PuzzleStatus;
  duration_seconds: number | null;
}

export interface Puzzle {
  display_name: string;
  topic: string;
  tries: Try[];
  status: PuzzleStatus;
}

export interface GameConfig {
  total_players: number;
  total_impostors: number;
  difficulty: string;
}

export interface Player {
  uid: string;
  impostor: boolean;
}

export interface Game {
  game_id: string;
  start_time: string;
  end_time: string | null;
  config: GameConfig;
  puzzles: Record<string, Puzzle>; // Dict[str, Puzzle]
  players: Player[];
  duration_seconds: number;
}
