'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Skeleton } from '../ui/skeleton';
import TopNav from './TopNav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsAuthenticated(loggedIn);
    if (!loggedIn) {
      router.replace('/login');
    }
  }, [router]);
  
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsAuthenticated(false);
    router.replace('/login');
  };

  if (!isClient || !isAuthenticated) {
    return (
      <div className="flex h-screen w-full bg-background p-4">
        <div className="flex-1 md:pl-4">
            <Skeleton className="w-full h-full rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav onLogout={handleLogout} />
      <main className="flex-1 p-4 md:p-8 pt-20">
          {children}
      </main>
    </div>
  );
}
