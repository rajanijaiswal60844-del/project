'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { Skeleton } from '../ui/skeleton';
import TopNav from './TopNav';
import { useUser } from '@/firebase';
import { getAuth } from 'firebase/auth';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const auth = getAuth();

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);

  const handleLogout = () => {
    auth.signOut();
    // The onAuthStateChanged listener in FirebaseProvider will handle the redirect
  };

  // Show a loading skeleton while Firebase is determining the auth state
  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen w-full bg-background p-4">
        <div className="flex-1">
          <Skeleton className="w-full h-full rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav onLogout={handleLogout} />
      <main className="p-4 md:p-8 pt-20 pb-20 md:pb-8">
        {children}
      </main>
    </div>
  );
}
