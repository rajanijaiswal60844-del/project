
import TicTacToe from '@/components/dashboard/TicTacToe';

export default function Home() {
  return (
    <div className="space-y-8 flex flex-col items-center">
      <div>
        <h1 className="text-3xl md:text-4xl font-headline font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to your dashboard. Here's a game to get you started!
        </p>
      </div>
      <div className="flex justify-center w-full">
        <TicTacToe />
      </div>
    </div>
  );
}
