'use client'

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addDoc, collection, doc, getDoc, serverTimestamp, setDoc, Timestamp, updateDoc } from "firebase/firestore";
import { TowerControl as GameController } from 'lucide-react';
import { useRouter } from "next/navigation";
import { useState } from "react";
import { db } from "../../lib/firebase";

export default function Page() {
  const router = useRouter();
  const [playerId, setPlayerId] = useState<string>('');
  const [joinGameId, setJoinGameId] = useState<string>('');

  const createGame = async () => {
    if (!playerId) return;

    const roomsRef = collection(db, "games", "tic-tac-toe", "rooms");
    const roomRef = await addDoc(roomsRef, {
      players: {
        X: playerId,
        O: null
      },
      createdAt: serverTimestamp()
    })

    const sessionRef = doc(db, "games", "tic-tac-toe", "rooms", roomRef.id, "sessions", Timestamp.now().seconds.toString());
    await setDoc(sessionRef, {
      board: Array(9).fill(""),
      currentTurn: 'X',
      createdAt: serverTimestamp(),
      players: {
        X: null,
        O: null
      },
    })

    await updateDoc(roomRef, {
      activeSessionId: sessionRef.id,
    });

    router.push(`tic-tac-toe/${roomRef.id}?playerId=${playerId}`);
  };

  const joinGame = async () => {
    if (!playerId || !joinGameId) return;

    const roomRef = doc(db, "games", "tic-tac-toe", "rooms", joinGameId);
    const docSnap = await getDoc(roomRef);
    if (docSnap.exists()) {
      const data = docSnap.data();

      if (data.players.O && data.players.X) {
        alert('Game is full');
        if (data.players.O === playerId || data.players.X === playerId) {
          alert('Use another name');
          return;
        }
        router.push(`tic-tac-toe/${joinGameId}?playerId=${playerId}`);
        return;
      }

      if (data.players.O) {
        if (data.players.O === playerId) {
          alert('Use another name');
          return;
        }
        await updateDoc(roomRef, {
          "players.X": playerId,
        });
        router.push(`tic-tac-toe/${joinGameId}?playerId=${playerId}`);
        return;
      }

      if (data.players.X) {
        if (data.players.X === playerId) {
          alert('Use another name');
          return;
        }
        await updateDoc(roomRef, {
          "players.O": playerId,
        });
        router.push(`tic-tac-toe/${joinGameId}?playerId=${playerId}`);
        return;
      }
    } else {
      alert('Game not found');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6">
        <div className="flex items-center justify-center mb-6">
          <GameController className="w-12 h-12 text-primary mb-2" />
        </div>
        <h1 className="text-3xl font-bold text-center mb-8">Tic Tac Toe</h1>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="playerId">Your Name</Label>
              <Input
                id="playerId"
                value={playerId}
                onChange={(e) => setPlayerId(e.target.value)}
                placeholder="Enter your name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="joinGameId">Game Code (Optional)</Label>
              <Input
                id="joinGameId"
                value={joinGameId}
                onChange={(e) => setJoinGameId(e.target.value)}
                placeholder="Enter game code"
              />
            </div>
          </div>

          {joinGameId ? (
            <Button
              onClick={joinGame}
              disabled={!playerId || !joinGameId}
              className="w-full"
              size="lg"
            >
              Join Game
            </Button>
          ) : (
            <Button
              onClick={createGame}
              disabled={!playerId}
              className="w-full"
              size="lg"
            >
              Create New Game
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}