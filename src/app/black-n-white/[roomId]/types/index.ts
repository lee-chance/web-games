import { Timestamp } from "firebase/firestore";

export type Player = string | null;
export type Symbol = "A" | "B";

export type Room = {
  createdAt: Timestamp;
  players: {
    A: Player;
    B: Player;
  };
  activeSessionId: string;
};

export type Game = {
  id: string;
  board: {
    A: number[];
    B: number[];
  };
  createdAt: Timestamp;
  currentTurn: Symbol;
  lastTurnTime: Timestamp | null;
  winner: Player;
  players: {
    A: Player;
    B: Player;
  };
};
