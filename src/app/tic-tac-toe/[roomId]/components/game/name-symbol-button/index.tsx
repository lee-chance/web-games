import { Button, ButtonProps } from "@/components/ui/button"
import { DocumentData, DocumentReference, updateDoc } from "firebase/firestore"
import { Player, Symbol } from "../../../types"

export default function NameSymbolButton({
  roomRef,
  playerId,
  players,
  symbol,
  isReady,
  ...props
}: {
  roomRef: DocumentReference<DocumentData, DocumentData>
  playerId: Player
  players: {
    X: Player
    O: Player
  }
  symbol: Symbol
  isReady: boolean
} & ButtonProps) {
  const handleChangeSymbol = async (symbol: Symbol) => {
    if (props.disabled) return;

    // 조건 1) X클릭
    // 조건 1-1) X가 비어있을때
    // 조건 1-1-1) 내가 O였을 때
    // 조건 1-1-1-1) Ready상태일때 -> 동작하지 않음
    // 조건 1-1-1-2) Ready가 아닐때 -> 이동, O는 null
    // 조건 1-1-2) 내가 뷰어였을 때 -> 이동
    // 조건 2) O클릭
    // 조건 2-1) O가 비어있을때
    // 조건 2-1-1) 내가 X였을 때
    // 조건 2-1-1-1) Ready상태일때 -> 동작하지 않음
    // 조건 2-1-1-2) Ready가 아닐때 -> 이동, X는 null
    // 조건 2-1-2) 내가 뷰어였을 때 -> 이동

    switch (symbol) {
      case 'X': // 1
        if (players.X === null) { // 1-1
          if (players.O === playerId) { // 1-1-1
            if (isReady) { // 1-1-1-2
              await updateDoc(roomRef, {
                "players.X": playerId,
                "players.O": null
              })
              return
            }
          } else { // 1-1-2
            await updateDoc(roomRef, {
              "players.X": playerId
            })
            return
          }
        }
        break;
      case 'O': // 2
        if (players.O === null) { // 2-1
          if (players.X === playerId) { // 2-1-1
            if (isReady) { // 2-1-1-2
              await updateDoc(roomRef, {
                "players.O": playerId,
                "players.X": null
              })
              return
            }
          } else { // 2-1-2
            await updateDoc(roomRef, {
              "players.O": playerId
            })
            return
          }
        }
        break;
    }
  }

  return (
    <Button
      variant={'outline'}
      onClick={() => handleChangeSymbol(symbol)}
      className="w-20"
      {...props}
    >
      {props.children}
    </Button>
  )
}