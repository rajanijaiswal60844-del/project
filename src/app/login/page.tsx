
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, AuthErrorCodes } from "firebase/auth";
import { useRouter }from 'next/navigation';
import { useUser } from '@/firebase';
import { Loader2, LogIn, UserPlus } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();
  const router = useRouter();
  const auth = getAuth();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if(!isUserLoading && user) {
      router.replace('/');
    }
  }, [user, isUserLoading, router])
  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ variant: "destructive", title: "Missing fields", description: "Email and password are required." });
      return;
    }
    setIsLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast({
        title: "Account Created",
        description: "You have been successfully signed up and logged in.",
      });
      router.push('/');
    } catch (error: any) {
       handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ variant: "destructive", title: "Missing fields", description: "Email and password are required." });
      return;
    }
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      router.push('/');
    } catch (error: any) {
      handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleAuthError = (error: any) => {
    console.error(error);
    let description = "An unexpected error occurred.";
    if (error.code) {
      switch (error.code) {
        case AuthErrorCodes.INVALID_EMAIL:
          description = "Please enter a valid email address.";
          break;
        case AuthErrorCodes.WEAK_PASSWORD:
          description = "The password must be at least 6 characters long.";
          break;
        case AuthErrorCodes.EMAIL_EXISTS:
          description = "An account with this email already exists. Please sign in.";
          setIsSignUp(false);
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
           description = "Invalid email or password.";
          break;
        default:
          description = error.message;
      }
    }
    toast({
      variant: "destructive",
      title: isSignUp ? "Sign Up Failed" : "Login Failed",
      description: description,
    });
  }

  const renderContent = () => {
    if (isSignUp) {
        return (
             <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email-signup">Email</Label>
                    <Input id="email-signup" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password-signup">Password</Label>
                    <Input id="password-signup" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : <><UserPlus className="mr-2 h-4 w-4" />Sign Up</>}
                </Button>
            </form>
        )
    }

    return (
         <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-login">Email</Label>
                <Input id="email-login" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} />
              </div>
              <div className="space-y-2">
                    <Label htmlFor="password-login">Password</Label>
                    <Input id="password-login" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} />
                </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing In...</> : <><LogIn className="mr-2 h-4 w-4" />Sign In</>}
            </Button>
        </form>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-blue-100 p-4">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">Project</CardTitle>
          <CardDescription>
            {isSignUp ? 'Create a new account' : 'Sign in to your account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
            {renderContent()}
        </CardContent>
        <CardFooter className="pt-4 text-center text-sm">
          <Button variant="link" onClick={() => setIsSignUp(!isSignUp)} disabled={isLoading}>
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
