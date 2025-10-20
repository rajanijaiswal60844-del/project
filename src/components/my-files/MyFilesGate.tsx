
'use client';

import { useState, useEffect, ReactNode, FormEvent } from 'react';
import { useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';

export default function MyFilesGate({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const { toast } = useToast();
  const [isVerified, setIsVerified] = useState(false);
  const [passwordState, setPasswordState] = useState<'needed' | 'set' | 'verified'>('needed');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const storageKey = user ? `my-files-password-${user.uid}` : null;

  useEffect(() => {
    if (storageKey) {
      const storedPassword = localStorage.getItem(storageKey);
      if (storedPassword) {
        setPasswordState('set');
      }
    }
  }, [storageKey]);

  const handleSetPassword = (e?: FormEvent) => {
    e?.preventDefault();
    if (password.length < 4) {
        toast({ variant: 'destructive', title: 'Password too short', description: 'Please use at least 4 characters.' });
        return;
    }
    if (password !== confirmPassword) {
      toast({ variant: 'destructive', title: 'Passwords do not match.' });
      return;
    }
    setShowConfirmDialog(true);
  };

  const confirmSetPassword = () => {
    if (storageKey) {
      localStorage.setItem(storageKey, password);
      toast({ title: 'Password Set!', description: 'You can now access your files.' });
      setIsVerified(true);
      setPasswordState('verified');
    }
    setShowConfirmDialog(false);
    setIsChangingPassword(false);
  }

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (storageKey) {
      const storedPassword = localStorage.getItem(storageKey);
      if (password === storedPassword) {
        setIsVerified(true);
        setPasswordState('verified');
      } else {
        toast({ variant: 'destructive', title: 'Incorrect Password' });
      }
    }
  };
  
  const handleChangePassword = () => {
      setIsChangingPassword(true);
      setIsVerified(false);
      setPasswordState('needed');
      setPassword('');
      setConfirmPassword('');
      toast({ title: 'Change Password', description: 'Please enter your new password.' });
  }

  if (isVerified) {
    return (
        <>
            {children}
            <div className="mt-8 flex justify-center">
                <Button variant="outline" onClick={handleChangePassword}>
                    <KeyRound className="mr-2 h-4 w-4" />
                    Change Password
                </Button>
            </div>
        </>
    );
  }

  return (
    <>
    <div className="flex items-center justify-center py-12">
        {passwordState === 'needed' || isChangingPassword ? (
             <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                        <ShieldCheck className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="font-headline text-2xl">{isChangingPassword ? 'Change' : 'Set'} Your Files Password</CardTitle>
                    <CardDescription>This password will be used to protect your private files. Store it safely.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSetPassword}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input id="new-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm Password</Label>
                            <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2">
                        <Button type="submit" className="w-full">{isChangingPassword ? 'Update Password' : 'Set Password'}</Button>
                        {isChangingPassword && <Button type="button" variant="ghost" onClick={() => { setIsChangingPassword(false); setPasswordState('set'); }}>Cancel</Button>}
                    </CardFooter>
                </form>
             </Card>
        ) : (
             <Card className="w-full max-w-md">
                 <CardHeader className="text-center">
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                        <KeyRound className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="font-headline text-2xl">Enter Password</CardTitle>
                    <CardDescription>Enter your password to access your files.</CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full">Unlock</Button>
                    </CardFooter>
                </form>
             </Card>
        )}
    </div>

    <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
                You are about to set a new password for your files. If you forget this password, you will lose access. There is no recovery option.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSetPassword}>
                Confirm & Set Password
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
