'use client';

import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { arrayUnion, doc, getDoc, serverTimestamp, setDoc, Timestamp, updateDoc } from "firebase/firestore";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Game, Player, Room } from "../../types";

type GamePageProps = {
  gameData: Game
  players: {
    A: Player
    B: Player
  }
}

export default function GamePage({ gameData, players }: GamePageProps) {
  const { roomId }: { roomId: string } = useParams();
  const searchParams = useSearchParams();
  const playerId = searchParams.get("playerId");

  const status =
    gameData.winner ? "finished"
      : gameData.players.A && gameData.players.B ? "playing"
        : players.A && players.B ? "standby"
          : "waiting"

  const roomRef = doc(db, "games", "black-n-white", "rooms", roomId);
  const sessionRef = doc(roomRef, "sessions", gameData.id);

  const timeLimit = 15
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
    const winnerSymbol = gameData.currentTurn === 'A' ? 'B' : 'A'
    await updateDoc(sessionRef, {
      winner: gameData.players[winnerSymbol],
      resultType: 'timeout'
    })
  };

  const handleRestart = async () => {
    // 1. 현재 활성 세션 종료
    const roomDoc = (await getDoc(roomRef)).data() as Room;
    if (roomDoc.activeSessionId) {
      const currentSessionRef = doc(roomRef, "sessions", roomDoc.activeSessionId);
      await updateDoc(currentSessionRef, {
        endedAt: serverTimestamp(),
      });
    }

    // 2. 새로운 세션 생성
    const sessionRef = doc(roomRef, "sessions", Timestamp.now().seconds.toString());
    await setDoc(sessionRef, {
      board: {
        A: [],
        B: []
      },
      currentTurn: 'A',
      createdAt: serverTimestamp(),
      players: {
        A: null,
        B: null
      },
    })

    // 3. 방의 activeSessionId 업데이트
    await updateDoc(roomRef, {
      activeSessionId: sessionRef.id,
      players: {
        A: roomDoc.players.B,
        B: roomDoc.players.A
      }
    });
  }

  const handleReady = async () => {
    if (playerId === players.A) {
      await updateDoc(sessionRef, {
        "players.A": playerId
      });
      return
    }

    if (playerId === players.B) {
      await updateDoc(sessionRef, {
        "players.B": playerId
      });
      return
    }
  }

  const handleUnready = async () => {
    if (playerId === players.A) {
      await updateDoc(sessionRef, {
        "players.A": null
      });
      return
    }

    if (playerId === players.B) {
      await updateDoc(sessionRef, {
        "players.B": null
      });
      return
    }
  }

  const handleMove = async (number: number) => {
    if (status !== 'playing') return

    if (gameData.players[gameData.currentTurn] !== playerId) return

    if (gameData.currentTurn === 'A') {
      await updateDoc(sessionRef, {
        "board.A": arrayUnion(number),
        currentTurn: 'B'
      });
      return
    }

    if (gameData.currentTurn === 'B') {
      await updateDoc(sessionRef, {
        "board.B": arrayUnion(number),
        currentTurn: 'A'
      });
      return
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Black N White</h1>

      <div>
        <div>
          <div className="flex justify-between items-end mb-2">
            {players.A === playerId && players.B}
            {players.B === playerId && players.A}
          </div>

          <OpponentHand players={players} playerId={playerId} board={gameData.board} />
        </div>

        <p className="text-xl font-bold text-center my-4">{status === 'playing' && gameData.players[gameData.currentTurn] !== playerId ? remainingTime : '-'}</p>

        <div>
          <div className="flex">
            {players.A === playerId && <PlayerBBoard board={gameData.board} />}
            {players.B === playerId && <PlayerABoard board={gameData.board} />}
          </div>

          <div className="flex">
            {players.A === playerId && <PlayerABoard board={gameData.board} />}
            {players.B === playerId && <PlayerBBoard board={gameData.board} />}
          </div>
        </div>

        <p className="text-xl font-bold text-center my-4">{status === 'playing' && gameData.players[gameData.currentTurn] === playerId ? remainingTime : '-'}</p>

        <div>
          <div className="flex justify-between items-end mb-2">
            {players.A === playerId && players.A}
            {players.B === playerId && players.B}

            {players.A === playerId && (
              status === 'finished' ? (
                <Button onClick={handleRestart}>
                  Restart
                </Button>
              ) : status !== 'playing' && (
                gameData.players.A !== players.A ? (
                  <Button onClick={handleReady}>
                    Ready
                  </Button>
                ) : (
                  <Button onClick={handleUnready}>
                    Cancel
                  </Button>
                )
              )
            )}

            {players.B === playerId && (
              status === 'finished' ? (
                <Button onClick={handleRestart}>
                  Restart
                </Button>
              ) : status !== 'playing' && (
                gameData.players.B !== players.B ? (
                  <Button onClick={handleReady}>
                    Ready
                  </Button>
                ) : (
                  <Button onClick={handleUnready}>
                    Cancel
                  </Button>
                )
              )
            )}
          </div>

          <MyHand players={players} playerId={playerId} board={gameData.board} onClickCard={handleMove} />
        </div>
      </div>
    </div>
  )
}

function EmptyCard() {
  return <div className="flex items-center justify-center size-10 border border-gray-300 bg-gray-200" />
}

function MyCard({ number, onClick }: { number: number, onClick: (number: number) => void }) {
  return number % 2 === 0 ? (
    <div
      className="flex items-center justify-center size-10 border border-gray-300 bg-black text-white cursor-pointer select-none"
      onClick={() => onClick(number)}
    >
      {number}
    </div>
  ) : (
    <div
      className="flex items-center justify-center size-10 border border-gray-300 bg-white text-black cursor-pointer select-none"
      onClick={() => onClick(number)}
    >
      {number}
    </div>
  )
}

function OpponentCard({ color }: { color: 'black' | 'white' }) {
  return color === 'black' ? (
    <div
      className="flex items-center justify-center size-10 border border-gray-300 bg-black text-white select-none"
    />
  ) : (
    <div
      className="flex items-center justify-center size-10 border border-gray-300 bg-white text-black select-none"
    />
  )
}

function OpponentHand({
  players,
  playerId,
  board
}: {
  players: {
    A: Player;
    B: Player;
  }
  playerId: Player;
  board: {
    A: number[];
    B: number[];
  }
}) {
  return (
    <>
      {players.A === playerId && (
        <div className="flex">
          {[...Array(9 - board.B.length)].map((_, i) => i + 1).map(number => {
            if (number % 2 === 0) {
              if ([...Array(9)].map((_, i) => i + 1).filter(number => !board.B.includes(number)).filter(number => number % 2 === 0).length >= number / 2) {
                return <OpponentCard key={number} color="black" />
              } else {
                return <OpponentCard key={number} color="white" />
              }
            } else {
              if ([...Array(9)].map((_, i) => i + 1).filter(number => !board.B.includes(number)).filter(number => number % 2 !== 0).length >= number / 2) {
                return <OpponentCard key={number} color="white" />
              } else {
                return <OpponentCard key={number} color="black" />
              }
            }
          })}
          {[...Array(board.B.length)].map((_, i) => <EmptyCard key={i} />)}
        </div>
      )}

      {players.B === playerId && (
        <div className="flex">
          {[...Array(9 - board.A.length)].map((_, i) => i + 1).map(number => {
            if (number % 2 === 0) {
              if ([...Array(9)].map((_, i) => i + 1).filter(number => !board.A.includes(number)).filter(number => number % 2 === 0).length >= number / 2) {
                return <OpponentCard key={number} color="black" />
              } else {
                return <OpponentCard key={number} color="white" />
              }
            } else {
              if ([...Array(9)].map((_, i) => i + 1).filter(number => !board.A.includes(number)).filter(number => number % 2 !== 0).length >= number / 2) {
                return <OpponentCard key={number} color="white" />
              } else {
                return <OpponentCard key={number} color="black" />
              }
            }
          })}
          {[...Array(board.A.length)].map((_, i) => <EmptyCard key={i} />)}
        </div>
      )}
    </>
  )
}

function MyHand({
  players,
  playerId,
  board,
  onClickCard
}: {
  players: {
    A: Player;
    B: Player;
  }
  playerId: Player;
  board: {
    A: number[];
    B: number[];
  }
  onClickCard: (number: number) => void
}) {
  return (
    <>
      {players.A === playerId && (
        <div className="flex">
          {[...Array(9)].map((_, i) => i + 1).map(number => {
            if (board.A.includes(number)) {
              return <EmptyCard key={number} />
            } else {
              return <MyCard key={number} number={number} onClick={onClickCard} />
            }
          })}
        </div>
      )}

      {players.B === playerId && (
        <div className="flex">
          {[...Array(9)].map((_, i) => i + 1).map(number => {
            if (board.B.includes(number)) {
              return <EmptyCard key={number} />
            } else {
              return <MyCard key={number} number={number} onClick={onClickCard} />
            }
          })}
        </div>
      )}
    </>
  )
}

function PlayerABoard({
  board
}: {
  board: {
    A: number[];
    B: number[];
  }
}) {
  return (
    <>
      {board.A.map((number, index) => {
        return number % 2 === 0 ? (
          <div
            key={number}
            className="flex items-center justify-center size-10 border border-gray-300 bg-black text-white"
          >
            {board.B[index] < number && "W"}
          </div>
        ) : (
          <div
            key={number}
            className="flex items-center justify-center size-10 border border-gray-300 bg-white text-black"
          >
            {board.B[index] < number && "W"}
          </div>
        )
      })}
      {[...Array(9 - board.A.length)].map((_, i) => i + 1).map(number => (
        <EmptyCard key={number} />
      ))}
    </>
  )
}

function PlayerBBoard({
  board
}: {
  board: {
    A: number[];
    B: number[];
  }
}) {
  return (
    <>
      {board.B.map((number, index) => {
        return number % 2 === 0 ? (
          <div
            key={number}
            className="flex items-center justify-center size-10 border border-gray-300 bg-black text-white"
          >
            {board.A[index] < number && "W"}
          </div>
        ) : (
          <div
            key={number}
            className="flex items-center justify-center size-10 border border-gray-300 bg-white text-black"
          >
            {board.A[index] < number && "W"}
          </div>
        )
      })}
      {[...Array(9 - board.B.length)].map((_, i) => i + 1).map(number => (
        <EmptyCard key={number} />
      ))}
    </>
  )
}