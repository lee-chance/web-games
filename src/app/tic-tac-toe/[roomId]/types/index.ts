import { Timestamp } from "firebase/firestore";

export type Player = string | null;
export type Symbol = "X" | "O";

export type Room = {
  createdAt: Timestamp;
  players: {
    O: Player;
    X: Player;
  };
  activeSessionId: string;
};

export type Game = {
  id: string;
  board: string[];
  createdAt: Timestamp;
  currentTurn: Symbol;
  lastTurnTime: Timestamp | null;
  winner: Player;
  players: {
    O: Player;
    X: Player;
  };
};
