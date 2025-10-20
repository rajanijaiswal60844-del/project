
'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dices, RefreshCw, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const playerColors = {
  'red': 'bg-red-500',
  'green': 'bg-green-500',
  'blue': 'bg-blue-500',
  'yellow': 'bg-yellow-400',
};

const playerPathColors = {
    'red': 'bg-red-200',
    'green': 'bg-green-200',
    'blue': 'bg-blue-200',
    'yellow': 'bg-yellow-200',
  };

const safeSpots = [1, 9, 14, 22, 27, 35, 40, 48];

const initialPieces = {
  red: Array(4).fill({ position: -1, state: 'home' }), // -1 is home
  green: Array(4).fill({ position: -1, state: 'home' }),
  blue: Array(4).fill({ position: -1, state: 'home' }),
  yellow: Array(4).fill({ position: -1, state: 'home' }),
};

const LudoGame = () => {
  const [pieces, setPieces] = useState(initialPieces);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<'red' | 'green' | 'blue' | 'yellow'>('red');
  const [winner, setWinner] = useState<string | null>(null);
  const [message, setMessage] = useState('Red player, roll the dice!');
  const [isRolling, setIsRolling] = useState(false);


  const rollDice = () => {
    if (isRolling) return;
    setIsRolling(true);
    const value = Math.floor(Math.random() * 6) + 1;
    setTimeout(() => {
        setDiceValue(value);
        setMessage(`${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)} rolled a ${value}.`);
        setIsRolling(false);
         if (value !== 6 && pieces[currentPlayer].every(p => p.state === 'home')) {
            setTimeout(nextTurn, 1000);
        }
    }, 500);
  };
  
  const nextTurn = () => {
    setDiceValue(null);
    const players: ('red' | 'green' | 'blue' | 'yellow')[] = ['red', 'green', 'blue', 'yellow'];
    const currentIndex = players.indexOf(currentPlayer);
    const nextPlayer = players[(currentIndex + 1) % 4];
    setCurrentPlayer(nextPlayer);
    setMessage(`${nextPlayer.charAt(0).toUpperCase() + nextPlayer.slice(1)} player, roll the dice!`);
  };

  const movePiece = (player: string, pieceIndex: number) => {
    // This is a placeholder for the full move logic
    // A complete implementation would be very long.
    if(player !== currentPlayer || !diceValue) return;

    const piece = pieces[player][pieceIndex];
    if (piece.state === 'home' && diceValue === 6) {
        // Move out of home
        const newPieces = {...pieces};
        newPieces[player][pieceIndex] = { position: 1, state: 'active' };
        setPieces(newPieces);
        setDiceValue(null); // Use the 6, don't switch turn
        setMessage(`${player.charAt(0).toUpperCase() + player.slice(1)} is on the board! Roll again.`);
    } else if (piece.state === 'active') {
        // Move on board
        const newPieces = {...pieces};
        newPieces[player][pieceIndex].position += diceValue;
        setPieces(newPieces);
        if (diceValue !== 6) {
            nextTurn();
        } else {
            setDiceValue(null);
            setMessage(`${player.charAt(0).toUpperCase() + player.slice(1)} rolled a 6! Roll again.`);
        }
    }
  };

  const renderPiece = (player: 'red' | 'green' | 'blue' | 'yellow', index: number) => {
    const piece = pieces[player][index];
    const canMove = currentPlayer === player && diceValue !== null;

    return (
        <div 
            key={index} 
            className={cn('w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center', playerColors[player], canMove && 'cursor-pointer animate-pulse')}
            onClick={() => movePiece(player, index)}
        >
            <span className="text-white font-bold text-sm">{index + 1}</span>
        </div>
    )
  }

  const resetGame = () => {
    setPieces(initialPieces);
    setDiceValue(null);
    setCurrentPlayer('red');
    setWinner(null);
    setMessage('Red player, roll the dice!');
  };
  
  return (
    <Card className="w-full max-w-4xl">
        <CardHeader className="text-center">
            <CardTitle className="font-headline text-3xl">Ludo King</CardTitle>
            <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col lg:flex-row items-center justify-center gap-8">
            {/* Ludo Board */}
            <div className="grid grid-cols-15 grid-rows-15 w-[375px] h-[375px] sm:w-[450px] sm:h-[450px] bg-card border-4 border-foreground rounded-md">
                {/* Red Home */}
                <div className="col-start-1 col-span-6 row-start-1 row-span-6 bg-red-400 p-4 grid grid-cols-2 grid-rows-2 gap-2 place-items-center rounded-tl-md">
                    {pieces.red.map((p, i) => p.state === 'home' && renderPiece('red', i))}
                </div>
                
                {/* Green Home */}
                <div className="col-start-10 col-span-6 row-start-1 row-span-6 bg-green-400 p-4 grid grid-cols-2 grid-rows-2 gap-2 place-items-center rounded-tr-md">
                    {pieces.green.map((p, i) => p.state === 'home' && renderPiece('green', i))}
                </div>

                 {/* Blue Home */}
                <div className="col-start-1 col-span-6 row-start-10 row-span-6 bg-blue-400 p-4 grid grid-cols-2 grid-rows-2 gap-2 place-items-center rounded-bl-md">
                     {pieces.blue.map((p, i) => p.state === 'home' && renderPiece('blue', i))}
                </div>

                {/* Yellow Home */}
                <div className="col-start-10 col-span-6 row-start-10 row-span-6 bg-yellow-300 p-4 grid grid-cols-2 grid-rows-2 gap-2 place-items-center rounded-br-md">
                    {pieces.yellow.map((p, i) => p.state === 'home' && renderPiece('yellow', i))}
                </div>

                {/* Paths */}
                {Array.from({length: 6}).map((_, i) => <div key={`r-h-${i}`} className={cn("col-start-2 row-start-7", i === 1 && playerPathColors.red, "border")}/>)}
                <div className="col-start-7 col-span-3 row-start-7 row-span-3 bg-gray-500 flex items-center justify-center rounded-md">
                    <Crown className="w-12 h-12 text-white" />
                </div>
                 {/* This is a simplified representation of the board path */}
                 <div className="col-start-7 row-start-1 col-span-1 row-span-6 bg-green-200 border-x" />
                 <div className="col-start-8 row-start-2 col-span-1 row-span-1 bg-green-500 border" />
                 <div className="col-start-9 row-start-1 col-span-1 row-span-6 bg-green-200 border-x" />

                 <div className="col-start-10 row-start-7 col-span-6 row-span-1 bg-yellow-200 border-y" />
                 <div className="col-start-14 row-start-8 col-span-1 row-span-1 bg-yellow-400 border" />
                 <div className="col-start-10 row-start-9 col-span-6 row-span-1 bg-yellow-200 border-y" />
                 
                 <div className="col-start-7 row-start-10 col-span-1 row-span-6 bg-blue-200 border-x" />
                 <div className="col-start-8 row-start-14 col-span-1 row-span-1 bg-blue-500 border" />
                 <div className="col-start-9 row-start-10 col-span-1 row-span-6 bg-blue-200 border-x" />

                 <div className="col-start-1 row-start-7 col-span-6 row-span-1 bg-red-200 border-y" />
                 <div className="col-start-2 row-start-8 col-span-1 row-span-1 bg-red-500 border" />
                 <div className="col-start-1 row-start-9 col-span-6 row-span-1 bg-red-200 border-y" />

            </div>

            {/* Controls */}
            <div className="flex flex-col items-center gap-6">
                <div className="flex flex-col items-center gap-2">
                    <h3 className="text-xl font-bold">Current Player</h3>
                    <div className={cn("w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-4xl shadow-lg", playerColors[currentPlayer])}>
                        {currentPlayer.charAt(0).toUpperCase()}
                    </div>
                </div>

                 <div className="flex flex-col items-center gap-2">
                    <h3 className="text-xl font-bold">Dice</h3>
                    <div className={cn("w-24 h-24 rounded-lg flex items-center justify-center text-6xl font-bold border-4", isRolling && 'animate-spin', playerColors[currentPlayer], 'border-white text-white')}>
                        {diceValue}
                    </div>
                </div>

                <div className="flex flex-col gap-4 w-full">
                    <Button onClick={rollDice} disabled={isRolling || diceValue !== null}>
                        <Dices className="mr-2 h-5 w-5" />
                        {isRolling ? 'Rolling...' : 'Roll Dice'}
                    </Button>
                    <Button onClick={resetGame} variant="outline">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        New Game
                    </Button>
                </div>
            </div>
        </CardContent>
    </Card>
  );
};

export default LudoGame;

