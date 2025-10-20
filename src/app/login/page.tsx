
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Ensure user is logged out when they reach the login page
    localStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('projects-access-granted');
  }, []);

  const handleLogin = () => {
    localStorage.setItem('isLoggedIn', 'true');
    toast({
        title: "Login Successful",
        description: "Welcome to your dashboard!",
    });
    router.push('/');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-blue-100">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">FaceFilter AI</CardTitle>
          <CardDescription>
            Welcome. Click below to access your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="text-center text-muted-foreground p-4">
                <p>Project access will require face verification.</p>
            </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            size="lg"
            onClick={handleLogin}
          >
            <LogIn className="mr-2 h-5 w-5" />
            Enter Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
