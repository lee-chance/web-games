import { Button } from "@/components/ui/button"
import { DocumentData, DocumentReference, updateDoc } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { Player } from "../../../types"

export default function LeaveButton({
  roomRef,
  playerId,
  players,
  isPlaying
}: {
  roomRef: DocumentReference<DocumentData, DocumentData>
  playerId: Player
  players: {
    X: Player
    O: Player
  }
  isPlaying: boolean
}) {
  const router = useRouter();

  const handleLeave = async () => {
    if (confirm("Are you sure you want to leave the game?")) {
      if (playerId === players.X) {
        await updateDoc(roomRef, {
          "players.X": null
        });
        router.back();
        return
      }

      if (playerId === players.O) {
        await updateDoc(roomRef, {
          "players.O": null
        });
        router.back();
        return
      }
    }
  }

  if (isPlaying) return

  return <Button variant={'destructive'} onClick={handleLeave}>Leave</Button>
}