'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const words = [
  'react', 'nextjs', 'tailwind', 'typescript', 'javascript', 'firebase', 'genkit', 'interface', 'component', 'developer'
];
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');
const MAX_INCORRECT_GUESSES = 6;


const HangmanDrawing = ({ numberOfGuesses }: { numberOfGuesses: number }) => {
    const head = (
        <div key="head" className="w-12 h-12 border-4 border-foreground rounded-full absolute top-[50px] right-[-22px]" />
    )

    const body = (
        <div key="body" className="w-1 h-24 bg-foreground absolute top-[98px] right-0" />
    )

    const rightArm = (
        <div key="rightArm" className="w-20 h-1 bg-foreground absolute top-[130px] right-[-80px] rotate-[-30deg] origin-bottom-left" />
    )
    
    const leftArm = (
         <div key="leftArm" className="w-20 h-1 bg-foreground absolute top-[130px] right-[1px] rotate-[30deg] origin-bottom-right" />
    )

    const rightLeg = (
        <div key="rightLeg" className="w-24 h-1 bg-foreground absolute top-[215px] right-[-92px] rotate-[60deg] origin-bottom-left" />
    )

    const leftLeg = (
        <div key="leftLeg" className="w-24 h-1 bg-foreground absolute top-[215px] right-[-1px] rotate-[-60deg] origin-bottom-right" />
    )

    const bodyParts = [head, body, rightArm, leftArm, rightLeg, leftLeg];

    return (
        <div className="relative h-80 w-64">
            <div className="h-12 w-1 bg-foreground absolute top-0 right-0"/>
            <div className="h-1 w-40 bg-foreground absolute top-0 right-0"/>
            <div className="h-full w-1 bg-foreground absolute top-0 left-20" />
            <div className="h-1 w-full bg-foreground" />
            {bodyParts.slice(0, numberOfGuesses)}
        </div>
    )
}

export default function HangmanGame() {
  const [wordToGuess, setWordToGuess] = useState('');
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [showResultDialog, setShowResultDialog] = useState(false);

  const incorrectGuesses = guessedLetters.filter(
    letter => !wordToGuess.includes(letter)
  );

  const isLoser = incorrectGuesses.length >= MAX_INCORRECT_GUESSES;
  const isWinner = wordToGuess.split('').every(letter => guessedLetters.includes(letter)) && wordToGuess !== '';

  const startGame = useCallback(() => {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    setWordToGuess(randomWord);
    setGuessedLetters([]);
    setShowResultDialog(false);
  }, []);

  useEffect(() => {
    startGame();
  }, [startGame]);

   useEffect(() => {
    if (isWinner || isLoser) {
      setTimeout(() => setShowResultDialog(true), 500);
    }
  }, [isWinner, isLoser]);


  const addGuessedLetter = useCallback((letter: string) => {
    if (guessedLetters.includes(letter) || isWinner || isLoser) return;
    setGuessedLetters(currentLetters => [...currentLetters, letter]);
  }, [guessedLetters, isWinner, isLoser]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (!key.match(/^[a-z]$/)) return;
      
      e.preventDefault();
      addGuessedLetter(key);
    };

    document.addEventListener("keypress", handler);
    return () => {
      document.removeEventListener("keypress", handler);
    }
  }, [addGuessedLetter]);
  
  return (
    <>
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-center">Hangman</CardTitle>
        <CardDescription className="text-center">Guess the word before you hang the man!</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-6">
        <HangmanDrawing numberOfGuesses={incorrectGuesses.length} />
        
        <div className="flex gap-2 text-2xl sm:text-4xl font-mono uppercase font-bold">
            {wordToGuess.split("").map((letter, index) => (
                <div key={index} className="border-b-4 border-foreground w-8 h-10 sm:w-12 sm:h-14 flex items-center justify-center">
                    <span className={cn('transition-opacity duration-300', guessedLetters.includes(letter) || isLoser ? 'opacity-100' : 'opacity-0')}>
                        {letter}
                    </span>
                </div>
            ))}
        </div>

        <div className="flex flex-wrap gap-2 justify-center max-w-full">
            {ALPHABET.map(key => {
                 const isActive = guessedLetters.includes(key);
                 const isIncorrect = incorrectGuesses.includes(key);
                 return (
                    <Button
                        key={key}
                        size="icon"
                        variant={isActive && !isIncorrect ? "success" : (isIncorrect ? "destructive" : "outline")}
                        className="h-10 w-10 sm:h-12 sm:w-12 text-lg font-bold"
                        onClick={() => addGuessedLetter(key)}
                        disabled={isActive || isWinner || isLoser}
                    >
                        {key.toUpperCase()}
                    </Button>
                 )
            })}
        </div>

      </CardContent>
    </Card>

    <AlertDialog open={showResultDialog}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-2xl">
                    {isWinner ? <CheckCircle className="text-green-500" /> : <XCircle className="text-red-500" />}
                    {isWinner ? "You Won!" : "Nice Try!"}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-lg">
                    {isLoser && `The word was: "${wordToGuess}"`}
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogAction onClick={startGame}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Play Again
            </AlertDialogAction>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}