import { DocumentData, DocumentReference, updateDoc } from "firebase/firestore";
import { Game, Player } from "../../../types";
import Board from "./components/board";

export default function GameBoard({
  sessionRef,
  gameData,
  playerId,
  disabled
}: {
  sessionRef: DocumentReference<DocumentData, DocumentData>
  gameData: Game
  playerId: Player
  disabled: boolean
}) {
  const handleCellClick = async (index: number) => {
    if (disabled) return;

    if (gameData.players[gameData.currentTurn] !== playerId) return;

    if (!gameData.board[index] && !gameData.winner) {
      const newBoard = [...gameData.board];
      newBoard[index] = gameData.currentTurn;

      await updateDoc(sessionRef, {
        board: newBoard,
      });
    }
  };

  return (
    <Board board={gameData.board} onCellClick={handleCellClick} />
  );
}