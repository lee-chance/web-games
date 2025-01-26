import { Button } from "@/components/ui/button";
import { doc, DocumentData, DocumentReference, getDoc, serverTimestamp, setDoc, Timestamp, updateDoc } from "firebase/firestore";
import { Room } from "../../../types";

export default function RestartButton({
  roomRef
}: {
  roomRef: DocumentReference<DocumentData, DocumentData>
}) {
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
      board: Array(9).fill(""),
      currentTurn: 'X',
      createdAt: serverTimestamp(),
      players: {
        X: null,
        O: null
      },
    })

    // 3. 방의 activeSessionId 업데이트
    await updateDoc(roomRef, {
      activeSessionId: sessionRef.id,
      players: {
        X: roomDoc.players.O,
        O: roomDoc.players.X
      }
    });
  }

  return (
    <Button onClick={handleRestart}>
      Restart
    </Button>
  );
}