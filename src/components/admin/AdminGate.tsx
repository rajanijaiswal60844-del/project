
'use client';

import { useState, FormEvent, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ADMIN_PASSWORD = 'jsjsjjsjj';
const SESSION_KEY = 'admin-verified';

export default function AdminGate({ children }: { children: React.ReactNode }) {
  const [isVerified, setIsVerified] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { toast } = useToast();

   useEffect(() => {
    // Check session storage on mount
    if (sessionStorage.getItem(SESSION_KEY) === 'true') {
      setIsVerified(true);
    }
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, 'true'); // Store verification in session storage
      setIsVerified(true);
      setError('');
      toast({ title: "Access Granted", description: "Welcome to the Admin Panel." });
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  if (!isVerified) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                <Lock className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="font-headline text-2xl">Admin Access Required</CardTitle>
            <CardDescription>Enter the password to access the admin panel.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">Unlock</Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
