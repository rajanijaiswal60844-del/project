
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RefreshCw, User, Bot } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { cn } from '@/lib/utils';

const Square = ({ value, onSquareClick, isWinning }: { value: string | null; onSquareClick: () => void; isWinning: boolean }) => {
  const highlightClass = isWinning ? 'bg-primary/20' : '';
  return (
    <button
      className={cn("h-20 w-20 sm:h-24 sm:w-24 border border-border flex items-center justify-center text-4xl font-bold transition-colors hover:bg-muted", highlightClass)}
      onClick={onSquareClick}
    >
      {value === 'X' && <span className="text-primary">{value}</span>}
      {value === 'O' && <span className="text-accent">{value}</span>}
    </button>
  );
};

type GameMode = 'human' | 'ai';
type Difficulty = 'easy' | 'medium' | 'hard';

const TicTacToe = () => {
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [gameMode, setGameMode] = useState<GameMode>('human');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');

  const winnerInfo = calculateWinner(squares);
  const winner = winnerInfo ? winnerInfo.winner : null;
  const winningLine = winnerInfo ? winnerInfo.line : [];
  const isDraw = !winner && squares.every(Boolean);

  const isAITurn = gameMode === 'ai' && !xIsNext;

  useEffect(() => {
    if (isAITurn && !winner && !isDraw) {
      const timeoutId = setTimeout(() => {
        const bestMove = findBestMove(squares, difficulty);
        if (bestMove !== -1) {
          handleClick(bestMove);
        }
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [squares, isAITurn, winner, isDraw, difficulty]);

  const handleClick = (i: number) => {
    if (squares[i] || winner) {
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
  };

  let status;
  if (winner) {
    status = `Winner: ${winner}`;
  } else if (isDraw) {
    status = "It's a Draw!";
  } else {
    status = `Next player: ${xIsNext ? 'X' : 'O'}`;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-center">Tic-Tac-Toe</CardTitle>
        <CardDescription className="text-center">Play against a friend or the AI!</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 items-center">
            <div>
              <Label className="font-semibold mb-2 block text-center sm:text-left">Game Mode</Label>
              <RadioGroup value={gameMode} onValueChange={(value: string) => setGameMode(value as GameMode)} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="human" id="human" />
                  <Label htmlFor="human" className="flex items-center gap-2"><User size={16} /> Human</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ai" id="ai" />
                  <Label htmlFor="ai" className="flex items-center gap-2"><Bot size={16} /> AI</Label>
                </div>
              </RadioGroup>
            </div>

            {gameMode === 'ai' && (
              <div>
                <Label className="font-semibold mb-2 block text-center sm:text-left">Difficulty</Label>
                <RadioGroup value={difficulty} onValueChange={(value: string) => setDifficulty(value as Difficulty)} className="flex gap-2 sm:gap-4">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="easy" id="easy" />
                        <Label htmlFor="easy">Easy</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="medium" id="medium" />
                        <Label htmlFor="medium">Medium</Label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <RadioGroupItem value="hard" id="hard" />
                        <Label htmlFor="hard">Hard</Label>
                    </div>
                </RadioGroup>
              </div>
            )}
        </div>

        <Button onClick={resetGame} variant="outline" className="w-full">
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset Game
        </Button>

        <div className="text-lg font-semibold pt-2">{status}</div>
        <div className="grid grid-cols-3">
          {squares.map((_, i) => (
            <Square key={i} value={squares[i]} onSquareClick={() => handleClick(i)} isWinning={winningLine.includes(i)} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

function calculateWinner(squares: (string | null)[]) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: lines[i] };
    }
  }
  return null;
}

function findBestMove(squares: (string | null)[], difficulty: Difficulty): number {
    const emptySquares = squares.map((sq, i) => sq === null ? i : null).filter(i => i !== null) as number[];
    
    if (difficulty === 'easy') {
        return emptySquares[Math.floor(Math.random() * emptySquares.length)];
    }

    if (difficulty === 'medium') {
        if (Math.random() > 0.5) { // 50% chance to make a random move
            return emptySquares[Math.floor(Math.random() * emptySquares.length)];
        }
    }

    // Hard difficulty or 50% of medium
    let bestVal = -Infinity;
    let move = -1;

    for (const i of emptySquares) {
        const newSquares = squares.slice();
        newSquares[i] = 'O';
        const moveVal = minimax(newSquares, 0, false);
        if (moveVal > bestVal) {
            move = i;
            bestVal = moveVal;
        }
    }
    return move;
}


function minimax(board: (string | null)[], depth: number, isMaximizing: boolean): number {
    const winnerInfo = calculateWinner(board);

    if (winnerInfo) {
        if (winnerInfo.winner === 'O') return 10 - depth;
        if (winnerInfo.winner === 'X') return -10 + depth;
    }

    if (board.every(Boolean)) {
        return 0;
    }

    const emptySquares = board.map((sq, i) => sq === null ? i : null).filter(i => i !== null) as number[];

    if (isMaximizing) {
        let best = -Infinity;
        for (const i of emptySquares) {
            const newBoard = board.slice();
            newBoard[i] = 'O';
            best = Math.max(best, minimax(newBoard, depth + 1, !isMaximizing));
        }
        return best;
    } else {
        let best = Infinity;
        for (const i of emptySquares) {
            const newBoard = board.slice();
            newBoard[i] = 'X';
            best = Math.min(best, minimax(newBoard, depth + 1, !isMaximizing));
        }
        return best;
    }
}


export default TicTacToe;
