
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';

const Square = ({ value, onSquareClick }: { value: string | null, onSquareClick: () => void }) => {
  return (
    <button
      className="h-24 w-24 border border-border flex items-center justify-center text-4xl font-bold transition-colors hover:bg-muted"
      onClick={onSquareClick}
    >
      {value === 'X' && <span className="text-primary">{value}</span>}
      {value === 'O' && <span className="text-accent">{value}</span>}
    </button>
  );
};

const TicTacToe = () => {
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);

  const handleClick = (i: number) => {
    if (squares[i] || calculateWinner(squares)) {
      return;
    }
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? 'X' : 'O';
    setSquares(nextSquares);
    setXIsNext(!xIsNext);
  };

  const resetGame = () => {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
  }

  const winner = calculateWinner(squares);
  let status;
  if (winner) {
    status = `Winner: ${winner}`;
  } else if (squares.every(Boolean)) {
      status = "It's a Draw!";
  } else {
    status = `Next player: ${xIsNext ? 'X' : 'O'}`;
  }

  return (
    <Card className="w-full max-w-md">
        <CardHeader>
            <CardTitle className="font-headline text-2xl text-center">Tic-Tac-Toe</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
            <div className="text-lg font-semibold">{status}</div>
            <div className="grid grid-cols-3">
                {squares.map((_, i) => (
                    <Square key={i} value={squares[i]} onSquareClick={() => handleClick(i)} />
                ))}
            </div>
            <Button onClick={resetGame} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset Game
            </Button>
        </CardContent>
    </Card>
  );
};

const calculateWinner = (squares: (string | null)[]) => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
};

export default TicTacToe;
