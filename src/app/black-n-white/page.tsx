'use client'

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addDoc, collection, doc, getDoc, serverTimestamp, setDoc, Timestamp, updateDoc } from "firebase/firestore";
import { TowerControl as GameController, Loader2 } from 'lucide-react';
import { useRouter } from "next/navigation";
import { useState } from "react";
import { db } from "../../lib/firebase";

export default function Page() {
  const router = useRouter();
  const [playerId, setPlayerId] = useState<string>('');
  const [joinGameId, setJoinGameId] = useState<string>('');
  const [isLoading, setLoading] = useState(false);

  const createGame = async () => {
    if (!playerId) return;

    setLoading(true);

    const roomsRef = collection(db, "games", "black-n-white", "rooms");
    const roomRef = await addDoc(roomsRef, {
      players: {
        A: playerId,
        B: null
      },
      createdAt: serverTimestamp()
    })

    const sessionRef = doc(roomsRef, roomRef.id, "sessions", Timestamp.now().seconds.toString());
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

    await updateDoc(roomRef, {
      activeSessionId: sessionRef.id,
    });

    router.push(`black-n-white/${roomRef.id}?playerId=${playerId}`);
  };

  const joinGame = async () => {
    if (!playerId || !joinGameId) return;

    setLoading(true);

    const roomRef = doc(db, "games", "black-n-white", "rooms", joinGameId);
    const docSnap = await getDoc(roomRef);
    if (docSnap.exists()) {
      const data = docSnap.data();

      if (data.players.B && data.players.A) {
        alert('Game is full');
        if (data.players.B === playerId || data.players.A === playerId) {
          alert('Use another name');
          setLoading(false);
          return;
        }
        router.push(`black-n-white/${joinGameId}?playerId=${playerId}`);
        return;
      }

      if (data.players.B) {
        if (data.players.B === playerId) {
          alert('Use another name');
          setLoading(false);
          return;
        }
        await updateDoc(roomRef, {
          "players.A": playerId,
        });
        router.push(`black-n-white/${joinGameId}?playerId=${playerId}`);
        return;
      }

      if (data.players.A) {
        if (data.players.A === playerId) {
          alert('Use another name');
          setLoading(false);
          return;
        }
        await updateDoc(roomRef, {
          "players.B": playerId,
        });
        router.push(`black-n-white/${joinGameId}?playerId=${playerId}`);
        return;
      }
    } else {
      alert('Game not found');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6">
        <div className="flex items-center justify-center mb-6">
          <GameController className="w-12 h-12 text-primary mb-2" />
        </div>
        <h1 className="text-3xl font-bold text-center mb-8">Black N White</h1>

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
              disabled={!playerId || !joinGameId || isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading && <Loader2 className="animate-spin" />}
              Join Game
            </Button>
          ) : (
            <Button
              onClick={createGame}
              disabled={!playerId || isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading && <Loader2 className="animate-spin" />}
              Create New Game
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}