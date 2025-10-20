
'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dices, RefreshCw, Crown, Users, Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from '../ui/label';

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

const initialPieces = {
  red: Array(4).fill({ position: -1, state: 'home' }), // -1 is home
  green: Array(4).fill({ position: -1, state: 'home' }),
  blue: Array(4).fill({ position: -1, state: 'home' }),
  yellow: Array(4).fill({ position: -1, state: 'home' }),
};

type Player = 'red' | 'green' | 'blue' | 'yellow';
type PlayerType = 'human' | 'ai';

const LudoGame = () => {
  const [pieces, setPieces] = useState(initialPieces);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player>('red');
  const [winner, setWinner] = useState<string | null>(null);
  const [message, setMessage] = useState('Setup your Ludo game!');
  const [isRolling, setIsRolling] = useState(false);
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'finished'>('setup');
  const [playerTypes, setPlayerTypes] = useState<Record<Player, PlayerType>>({
      red: 'human',
      green: 'ai',
      blue: 'ai',
      yellow: 'ai',
  });
  const [activePlayers, setActivePlayers] = useState<Player[]>(['red', 'green']);

  const handlePlayerTypeChange = (player: Player, type: PlayerType) => {
    setPlayerTypes(prev => ({...prev, [player]: type}));
  }

  const handleNumPlayersChange = (num: string) => {
    const numPlayers = parseInt(num, 10);
    const players: Player[] = ['red', 'green', 'blue', 'yellow'];
    setActivePlayers(players.slice(0, numPlayers));
  }

  const startGame = () => {
    resetGame(false);
    setGameState('playing');
    setMessage('Red player, roll the dice!');
  }

  useEffect(() => {
    if (gameState === 'playing' && playerTypes[currentPlayer] === 'ai' && !isRolling && diceValue === null) {
      setTimeout(rollDice, 1000);
    } else if (gameState === 'playing' && playerTypes[currentPlayer] === 'ai' && diceValue !== null) {
        // AI move logic placeholder
        setTimeout(() => {
            const movablePieces = pieces[currentPlayer].map((p, i) => ({...p, index: i})).filter(p => {
                if (p.state === 'home' && diceValue === 6) return true;
                if (p.state === 'active') return true;
                return false;
            });

            if (movablePieces.length > 0) {
                 movePiece(currentPlayer, movablePieces[0].index);
            } else {
                 nextTurn();
            }
        }, 1000);
    }
  }, [currentPlayer, gameState, diceValue, isRolling, playerTypes]);


  const rollDice = () => {
    if (isRolling || (playerTypes[currentPlayer] === 'human' && diceValue !== null)) return;
    setIsRolling(true);
    const value = Math.floor(Math.random() * 6) + 1;
    setTimeout(() => {
        setDiceValue(value);
        setMessage(`${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)} rolled a ${value}.`);
        setIsRolling(false);
         if (value !== 6 && pieces[currentPlayer].every(p => p.state === 'home') && !activePlayers.slice(1).includes(currentPlayer)) {
            setTimeout(nextTurn, 1000);
        }
    }, 500);
  };
  
  const nextTurn = () => {
    setDiceValue(null);
    const currentIndex = activePlayers.indexOf(currentPlayer);
    const nextPlayer = activePlayers[(currentIndex + 1) % activePlayers.length];
    setCurrentPlayer(nextPlayer);
    setMessage(`${nextPlayer.charAt(0).toUpperCase() + nextPlayer.slice(1)}'s turn. Roll the dice!`);
  };

  const movePiece = (player: Player, pieceIndex: number) => {
    if(player !== currentPlayer || !diceValue) return;

    const piece = pieces[player][pieceIndex];
    if (piece.state === 'home' && diceValue === 6) {
        const newPieces = {...pieces};
        newPieces[player][pieceIndex] = { position: 1, state: 'active' };
        setPieces(newPieces);
        setDiceValue(null); 
        setMessage(`${player.charAt(0).toUpperCase() + player.slice(1)} is on the board! Roll again.`);
    } else if (piece.state === 'active') {
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

  const renderPiece = (player: Player, index: number) => {
    const piece = pieces[player][index];
    const isHumanTurn = playerTypes[currentPlayer] === 'human';
    const canMove = currentPlayer === player && diceValue !== null && isHumanTurn;

    return (
        <div 
            key={index} 
            className={cn('w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center', playerColors[player], canMove && 'cursor-pointer animate-pulse')}
            onClick={() => canMove && movePiece(player, index)}
        >
            <span className="text-white font-bold text-sm">{index + 1}</span>
        </div>
    )
  }

  const resetGame = (toSetup = true) => {
    setPieces(initialPieces);
    setDiceValue(null);
    setCurrentPlayer('red');
    setWinner(null);
    if (toSetup) {
        setGameState('setup');
        setMessage('Setup your Ludo game!');
    }
  };

  if (gameState === 'setup') {
      return (
          <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <CardTitle className="font-headline text-3xl">Ludo Game Setup</CardTitle>
                <CardDescription>{message}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label>Number of Players</Label>
                    <Select onValueChange={handleNumPlayersChange} defaultValue="2">
                        <SelectTrigger>
                            <SelectValue placeholder="Select number of players" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="2">2 Players</SelectItem>
                            <SelectItem value="3">3 Players</SelectItem>
                            <SelectItem value="4">4 Players</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {activePlayers.map(player => (
                        <div key={player} className="space-y-2">
                            <Label className={cn("flex items-center gap-2 font-bold", `text-${player}-500`)}>
                                <div className={cn("w-4 h-4 rounded-full", playerColors[player])} />
                                {player.charAt(0).toUpperCase() + player.slice(1)}
                            </Label>
                            <Select onValueChange={(type: PlayerType) => handlePlayerTypeChange(player, type)} defaultValue={playerTypes[player]}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select player type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="human"><div className="flex items-center gap-2"><User className="w-4 h-4"/> Human</div></SelectItem>
                                    <SelectItem value="ai"><div className="flex items-center gap-2"><Bot className="w-4 h-4"/> AI</div></SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    ))}
                </div>

                <Button onClick={startGame} className="w-full">Start Game</Button>
              </CardContent>
          </Card>
      )
  }
  
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
                    {activePlayers.includes('red') && pieces.red.map((p, i) => p.state === 'home' && renderPiece('red', i))}
                </div>
                
                {/* Green Home */}
                <div className="col-start-10 col-span-6 row-start-1 row-span-6 bg-green-400 p-4 grid grid-cols-2 grid-rows-2 gap-2 place-items-center rounded-tr-md">
                    {activePlayers.includes('green') && pieces.green.map((p, i) => p.state === 'home' && renderPiece('green', i))}
                </div>

                 {/* Blue Home */}
                <div className="col-start-1 col-span-6 row-start-10 row-span-6 bg-blue-400 p-4 grid grid-cols-2 grid-rows-2 gap-2 place-items-center rounded-bl-md">
                     {activePlayers.includes('blue') && pieces.blue.map((p, i) => p.state === 'home' && renderPiece('blue', i))}
                </div>

                {/* Yellow Home */}
                <div className="col-start-10 col-span-6 row-start-10 row-span-6 bg-yellow-300 p-4 grid grid-cols-2 grid-rows-2 gap-2 place-items-center rounded-br-md">
                    {activePlayers.includes('yellow') && pieces.yellow.map((p, i) => p.state === 'home' && renderPiece('yellow', i))}
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
                        {playerTypes[currentPlayer] === 'ai' ? <Bot size={48} /> : currentPlayer.charAt(0).toUpperCase()}
                    </div>
                </div>

                 <div className="flex flex-col items-center gap-2">
                    <h3 className="text-xl font-bold">Dice</h3>
                    <div className={cn("w-24 h-24 rounded-lg flex items-center justify-center text-6xl font-bold border-4", isRolling && 'animate-spin', playerColors[currentPlayer], 'border-white text-white')}>
                        {diceValue}
                    </div>
                </div>

                <div className="flex flex-col gap-4 w-full">
                    <Button onClick={rollDice} disabled={isRolling || diceValue !== null || playerTypes[currentPlayer] === 'ai'}>
                        <Dices className="mr-2 h-5 w-5" />
                        {isRolling ? 'Rolling...' : 'Roll Dice'}
                    </Button>
                    <Button onClick={() => resetGame(true)} variant="outline">
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

    