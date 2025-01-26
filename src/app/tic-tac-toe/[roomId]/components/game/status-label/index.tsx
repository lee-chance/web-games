import { Game } from "../../../types";

export default function StatusLabel({
  status,
  gameData
}: {
  status: "waiting" | "standby" | "playing" | "finished"
  gameData: Game
}) {
  const statusLabel = () => {
    if (status === 'waiting') return 'Waiting...';
    if (status === 'standby') return 'Ready to start';
    if (status === 'playing') return `${gameData.players[gameData.currentTurn]}'s Turn`;
    if (status === 'finished') {
      if (gameData.winner === 'draw') return 'Draw';
      return `${gameData.winner} wins`;
    }
  }

  return (
    <p className="w-36 text-center">{statusLabel()}</p>
  );
}