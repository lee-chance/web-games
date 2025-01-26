"use client";

import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import GamePage from "./components/game";
import Loading from "./components/loading";
import { Game, Room } from "./types";

export default function Page() {
  const { roomId }: { roomId: string } = useParams();
  const [roomData, setRoomData] = useState<Room | null>(null);
  const [gameData, setGameData] = useState<Game | null>(null);

  useEffect(() => {
    console.log('hi', roomData, roomId)
    if (roomId) {
      console.log('리스너 등록')
      const docRef = doc(db, "games", "tic-tac-toe", "rooms", roomId);
      const unsubscribe = onSnapshot(docRef, (doc) => {
        const data = doc.data() as Room
        setRoomData(data);
      });

      return () => {
        console.log('리스너 roomData', roomData)
        unsubscribe()
        console.log('리스너 해제', roomData)
      };
    }
  }, [roomId]);

  useEffect(() => {
    if (roomData) {
      console.log('session 리스너 등록')
      const docRef = doc(db, "games", "tic-tac-toe", "rooms", roomId, "sessions", roomData.activeSessionId);
      const unsubscribe = onSnapshot(docRef, (doc) => {
        const data = { ...doc.data() as Game, id: doc.id };
        setGameData(data);
      });

      return () => {
        unsubscribe()
        console.log('session 리스너 해제')
      };
    }
  }, [roomData])

  if (!roomData || !gameData) return <Loading />;
  return <GamePage gameData={gameData} players={roomData.players} />;
};