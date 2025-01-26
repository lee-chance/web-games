import { Button } from "@/components/ui/button"
import { DocumentData, DocumentReference, updateDoc } from "firebase/firestore"
import { Player } from "../../../types"

export default function ReadyButton({
  sessionRef,
  playerId,
  players,
  isReady,
  isPlaying
}: {
  sessionRef: DocumentReference<DocumentData, DocumentData>
  playerId: Player
  players: {
    X: Player
    O: Player
  }
  isReady: boolean
  isPlaying: boolean
}) {
  const handleReady = async () => {
    if (playerId === players.X) {
      await updateDoc(sessionRef, {
        "players.X": playerId
      });
      return
    }

    if (playerId === players.O) {
      await updateDoc(sessionRef, {
        "players.O": playerId
      });
      return
    }
  }

  const handleUnready = async () => {
    if (playerId === players.X) {
      await updateDoc(sessionRef, {
        "players.X": null
      });
      return
    }

    if (playerId === players.O) {
      await updateDoc(sessionRef, {
        "players.O": null
      });
      return
    }
  }

  if (isPlaying) return

  return isReady ? (
    <Button onClick={handleUnready}>Cancel</Button>
  ) : (
    <Button onClick={handleReady}>Ready</Button>
  )
}