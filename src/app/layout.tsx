import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import ClientLayout from './client-layout';
import { ProjectsProvider } from '@/context/ProjectsContext';

export const metadata: Metadata = {
  title: 'FaceFilter AI',
  description: 'An AI-powered application for face-based interactions.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ProjectsProvider>
          <ClientLayout>{children}</ClientLayout>
        </ProjectsProvider>
        <Toaster />
      </body>
    </html>
  );
}
