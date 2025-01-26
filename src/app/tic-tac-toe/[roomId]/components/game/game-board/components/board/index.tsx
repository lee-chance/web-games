interface BoardProps {
  board: string[];
  onCellClick: (index: number) => void;
}

export default function Board({
  board,
  onCellClick
}: BoardProps) {
  return (
    <div className="grid grid-cols-3 gap-0 w-48">
      {board.map((cell, index) => (
        <div
          key={index}
          className="w-16 h-16 flex items-center justify-center border-2 border-gray-300 text-xl font-bold cursor-pointer"
          onClick={() => onCellClick(index)}
        >
          {cell}
        </div>
      ))}
    </div>
  );
};