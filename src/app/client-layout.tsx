'use client';

import { usePathname } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <>
      {isLoginPage ? (
        children
      ) : (
        <AppLayout>{children}</AppLayout>
      )}
    </>
  );
}
