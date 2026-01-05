// src/types/games.ts
export enum PuzzleStatus {
  INACTIVE = "INACTIVE",
  STARTING_GAME = "STARTING_GAME",
  IDLE = "IDLE",
  ACTIVE = "ACTIVE",
  SOLVED = "SOLVED",
  SABOTAGED = "SABOTAGED",
  FAILED = "FAILED"
}

export enum GameStatus {
  LOBBY = "LOBBY",
  RUNNING = "RUNNING",
  ENDED = "ENDED"
}

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
  connected?: boolean; // Añadido el campo opcional
}

export interface GameConfig {
  total_players: number;
  total_impostors: number;
  difficulty: string;
}

export interface Player {
  uid: string;
  impostor: boolean;
  joined_at?: string;
}

export interface Game {
  game_id: string;
  start_time: string;
  end_time: string | null;
  status: GameStatus;
  config: GameConfig;
  puzzles: Record<string, Puzzle>;
  players: Player[];
  duration_seconds: number;
}