
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RefreshCw, Star, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const icons = [
  'anchor', 'bomb', 'bug', 'diamond', 'ghost', 'globe',
  'heart', 'moon', 'rocket', 'sun', 'star', 'cloud'
];

const generateCards = () => {
  const gameIcons = icons.slice(0, 8); // Use 8 pairs
  const duplicatedIcons = [...gameIcons, ...gameIcons];
  const shuffledIcons = duplicatedIcons.sort(() => Math.random() - 0.5);
  return shuffledIcons.map((icon, index) => ({
    id: index,
    icon: icon,
    isFlipped: false,
    isMatched: false,
  }));
};

const MemoryMatch = () => {
  const [cards, setCards] = useState(generateCards());
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isGameWon, setIsGameWon] = useState(false);

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [firstId, secondId] = flippedCards;
      const firstCard = cards[firstId];
      const secondCard = cards[secondId];

      if (firstCard.icon === secondCard.icon) {
        // Match
        setCards(prevCards =>
          prevCards.map(card =>
            card.icon === firstCard.icon ? { ...card, isMatched: true } : card
          )
        );
        setFlippedCards([]);
      } else {
        // No Match
        setTimeout(() => {
          setCards(prevCards =>
            prevCards.map(card =>
              flippedCards.includes(card.id) ? { ...card, isFlipped: false } : card
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
      setMoves(prev => prev + 1);
    }
  }, [flippedCards, cards]);

  useEffect(() => {
    const allMatched = cards.every(card => card.isMatched);
    if (allMatched && cards.length > 0) {
      setIsGameWon(true);
    }
  }, [cards]);


  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2 || cards[id].isFlipped) return;

    setCards(prevCards =>
      prevCards.map(card =>
        card.id === id ? { ...card, isFlipped: true } : card
      )
    );
    setFlippedCards(prev => [...prev, id]);
  };

  const resetGame = () => {
    setCards(generateCards());
    setFlippedCards([]);
    setMoves(0);
    setIsGameWon(false);
  };

  const LucideIcon = ({ name, className }: { name: string; className: string }) => {
    const Icon = require('lucide-react')[name.charAt(0).toUpperCase() + name.slice(1)];
    return Icon ? <Icon className={className} /> : null;
  };

  return (
    <Card className="w-full max-w-2xl relative overflow-hidden">
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-2xl">Memory Match</CardTitle>
        <CardDescription>Find all the matching pairs!</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <div className="flex justify-between w-full px-4">
          <div className="font-semibold text-lg">Moves: {moves}</div>
          <Button onClick={resetGame} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            New Game
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-4 p-4">
          {cards.map(card => (
            <motion.div
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className="w-20 h-20 sm:w-24 sm:h-24"
              style={{ perspective: 1000 }}
            >
              <motion.div
                className="relative w-full h-full"
                style={{ transformStyle: 'preserve-3d' }}
                animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="absolute w-full h-full rounded-lg bg-primary flex items-center justify-center cursor-pointer shadow-md" style={{ backfaceVisibility: 'hidden' }}>
                    <Star className="h-1/2 w-1/2 text-primary-foreground" />
                </div>
                <div className="absolute w-full h-full rounded-lg bg-card border-2 border-primary flex items-center justify-center cursor-pointer shadow-md" style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}>
                  <LucideIcon name={card.icon} className="h-1/2 w-1/2 text-primary" />
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </CardContent>

      <AnimatePresence>
        {isGameWon && (
          <motion.div
            className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <Trophy className="w-24 h-24 text-amber-400" />
            <h2 className="text-3xl font-bold font-headline mt-4">You Win!</h2>
            <p className="text-muted-foreground mt-2">You completed the game in {moves} moves.</p>
            <Button onClick={resetGame} className="mt-6">
              <RefreshCw className="mr-2 h-4 w-4" />
              Play Again
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default MemoryMatch;
