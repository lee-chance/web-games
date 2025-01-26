'use client';

import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Game, Player } from "../../types";
import GameBoard from "./game-board/indext";
import LeaveButton from "./leave-button";
import NameSymbolButton from "./name-symbol-button";
import ReadyButton from "./ready-button";
import RestartButton from "./restart-button";
import StatusLabel from "./status-label";

type GamePageProps = {
  gameData: Game
  players: {
    X: Player
    O: Player
  }
}

export default function GamePage({ gameData, players }: GamePageProps) {
  const { roomId }: { roomId: string } = useParams();
  const searchParams = useSearchParams();
  const playerId = searchParams.get("playerId");

  const status =
    gameData.winner ? "finished"
      : gameData.players.X && gameData.players.O ? "playing"
        : players.X && players.O ? "standby"
          : "waiting"

  const roomRef = doc(db, "games", "tic-tac-toe", "rooms", roomId);
  const sessionRef = doc(roomRef, "sessions", gameData.id);

  const timeLimit = 5
  const [remainingTime, setRemainingTime] = useState(timeLimit);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (gameData && status === 'playing') {
      setRemainingTime(timeLimit);

      const intervalId = setInterval(() => {
        setRemainingTime((prev) => Math.max(0, prev - 1));
      }, 1000);

      setTimer(intervalId)

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [gameData]);

  useEffect(() => {
    if (remainingTime <= 0) {
      if (timer) clearInterval(timer);
      handleTimeout();
    }
  }, [remainingTime])

  const handleTimeout = async () => {
    const winnerSymbol = gameData.currentTurn === 'X' ? 'O' : 'X'
    await updateDoc(sessionRef, {
      winner: gameData.players[winnerSymbol],
      resultType: 'timeout'
    })
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Tic Tac Toe</h1>

      <div className="flex mb-4 gap-4 items-center">
        <NameSymbolButton
          roomRef={roomRef}
          playerId={playerId}
          players={players}
          symbol="X"
          isReady={gameData.players.O !== playerId}
          disabled={status === 'playing' || gameData.players.X !== null}
        >
          <p className="w-full text-center">{players.X}</p>
          <p>X</p>
        </NameSymbolButton>

        <p className="w-2">{status === 'playing' && gameData.currentTurn === 'X' ? remainingTime : ''}</p>

        <StatusLabel status={status} gameData={gameData} />

        <p className="w-2">{status === 'playing' && gameData.currentTurn === 'O' ? remainingTime : ''}</p>

        <NameSymbolButton
          roomRef={roomRef}
          playerId={playerId}
          players={players}
          symbol="O"
          isReady={gameData.players.X !== playerId}
          disabled={status === 'playing' || gameData.players.O !== null}
        >
          <p>O</p>
          <p className="w-full text-center">{players.O}</p>
        </NameSymbolButton>
      </div>

      <div className="flex mb-4 gap-4">
        <div className="w-20 flex flex-col items-center gap-2">
          {players.X === playerId && (
            <>
              {status === 'finished' ? (
                <RestartButton
                  roomRef={roomRef}
                />
              ) : (
                <ReadyButton
                  sessionRef={sessionRef}
                  playerId={playerId}
                  players={players}
                  isReady={gameData.players.X === playerId}
                  isPlaying={status === 'playing'}
                />
              )}
              <LeaveButton
                roomRef={roomRef}
                playerId={playerId}
                players={players}
                isPlaying={status === 'playing'}
              />
            </>
          )}
        </div>

        <GameBoard
          sessionRef={sessionRef}
          gameData={gameData}
          playerId={playerId}
          disabled={status !== 'playing'}
        />

        <div className="w-20 flex flex-col items-center gap-2">
          {players.O === playerId && (
            <>
              {status === 'finished' ? (
                <RestartButton
                  roomRef={roomRef}
                />
              ) : (
                <ReadyButton
                  sessionRef={sessionRef}
                  playerId={playerId}
                  players={players}
                  isReady={gameData.players.O === playerId}
                  isPlaying={status === 'playing'}
                />
              )}
              <LeaveButton
                roomRef={roomRef}
                playerId={playerId}
                players={players}
                isPlaying={status === 'playing'}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}