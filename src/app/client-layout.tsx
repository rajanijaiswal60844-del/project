
'use client';

import { usePathname } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import GameLayout from '@/components/layout/GameLayout';

const gameRoutes = ['/tictactoe', '/memory-match'];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';
  const isGamePage = gameRoutes.includes(pathname);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isGamePage) {
    return <GameLayout>{children}</GameLayout>;
  }

  return (
    <AppLayout>{children}</AppLayout>
  );
}
