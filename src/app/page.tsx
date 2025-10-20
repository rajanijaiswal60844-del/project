
'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="space-y-8 flex flex-col items-center text-center">
      <div>
        <h1 className="text-3xl md:text-4xl font-headline font-bold text-foreground">Welcome to your Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Your central hub for projects and tasks. Let's get started!
        </p>
      </div>
      <div className="flex justify-center w-full">
        <Button size="lg" onClick={() => router.push('/tictactoe')}>
            Play Tic-Tac-Toe
        </Button>
      </div>
    </div>
  );
}
