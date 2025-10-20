
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { ArrowLeft } from 'lucide-react';

export default function GameLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-4">
        <Button variant="outline" onClick={() => router.push('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
        </Button>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-4">
          {children}
      </main>
    </div>
  );
}
