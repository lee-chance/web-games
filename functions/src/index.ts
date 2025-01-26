// ---- Sample Code
// import * as logger from "firebase-functions/logger";
// import { onRequest } from "firebase-functions/v2/https";

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", { structuredData: true });
//   response.send("Hello from Firebase!");
// });
// ---- Sample Code

import { FieldValue } from "firebase-admin/firestore";
import { onDocumentUpdated } from "firebase-functions/v2/firestore";

export const checkWinner = onDocumentUpdated(
  {
    document: "games/tic-tac-toe/rooms/{roomId}/sessions/{sessionId}",
    region: "asia-northeast2",
  },
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();

    if (!before || !after) {
      console.error("Invalid document data");
      return;
    }

    // Check if the board state has changed
    if (JSON.stringify(before.board) === JSON.stringify(after.board)) {
      return;
    }

    const board = after.board as string[];
    const combos = getCombos(board);

    if (combos) {
      const winSymbol = board[combos[0]];
      const winner = after.players[winSymbol];
      await event.data?.after.ref.update({
        winner,
        resultType: combos.toString(),
      });
      return;
    }

    if (board.every((cell) => cell)) {
      await event.data?.after.ref.update({
        winner: "draw",
        resultType: "draw",
      });
      return;
    }

    const nextTurn = after.currentTurn === "X" ? "O" : "X";
    await event.data?.after.ref.update({
      currentTurn: nextTurn,
      lastTurnTime: FieldValue.serverTimestamp(),
    });
  }
);

function getCombos(board: string[]): number[] | null {
  const winningCombos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // Rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // Columns
    [0, 4, 8],
    [2, 4, 6], // Diagonals
  ];

  for (const [a, b, c] of winningCombos) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return [a, b, c];
    }
  }

  return null;
}
