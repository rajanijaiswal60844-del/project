'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();

  return (
    <div className="space-y-8 flex flex-col items-center text-center">
      <div>
        <h1 className="text-3xl md:text-4xl font-headline font-bold text-foreground">Welcome to my project</h1>
        <p className="text-muted-foreground mt-2">
          Your central hub for games and projects. Let's get started!
        </p>
      </div>

      <div className="w-full max-w-lg">
          <Image 
              src="https://picsum.photos/seed/monkey/600/400"
              alt="Laughing Monkey"
              width={600}
              height={400}
              className="rounded-lg shadow-lg"
              data-ai-hint="laughing monkey"
          />
      </div>

      <div className="flex justify-center w-full flex-wrap gap-4">
        <Button size="lg" onClick={() => router.push('/tictactoe')}>
            Play Tic-Tac-Toe
        </Button>
        <Button size="lg" onClick={() => router.push('/memory-match')}>
            Play Memory Match
        </Button>
      </div>
    </div>
  );
}
