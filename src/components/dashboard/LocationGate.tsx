
'use client';

import { useState, useEffect, ReactNode } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Loader2, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const LOCATION_TIMEOUT = 2 * 60 * 1000; // 2 minutes

export default function LocationGate({ children }: { children: ReactNode }) {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    
    const [isVerified, setIsVerified] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt');
    
    useEffect(() => {
        const lastLocationTime = sessionStorage.getItem(`locationTime-${user?.uid}`);
        if (lastLocationTime && (Date.now() - parseInt(lastLocationTime, 10)) < LOCATION_TIMEOUT) {
            setIsVerified(true);
            return;
        }

        navigator.permissions?.query({ name: 'geolocation' }).then((result) => {
            setPermissionStatus(result.state);
            if (result.state === 'granted') {
                handleGetLocation();
            }
             result.onchange = () => {
                setPermissionStatus(result.state);
                 if (result.state === 'granted') {
                    handleGetLocation();
                }
            };
        });

    }, [user?.uid]);

    const handleGetLocation = () => {
        if (!user || !firestore) return;
        
        setIsVerifying(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const userRef = doc(firestore, 'users', user.uid);
                const locationData = {
                    latitude,
                    longitude,
                    timestamp: serverTimestamp(),
                };

                try {
                    await setDoc(userRef, { location: locationData }, { merge: true })
                     .catch((serverError) => {
                        const permissionError = new FirestorePermissionError({
                            path: userRef.path,
                            operation: 'update',
                            requestResourceData: { location: locationData },
                        });
                        errorEmitter.emit('permission-error', permissionError);
                        throw serverError;
                    });
                    
                    sessionStorage.setItem(`locationTime-${user.uid}`, Date.now().toString());
                    toast({ title: 'Location captured!' });
                    setIsVerified(true);

                } catch (error) {
                     if (!(error instanceof FirestorePermissionError)) {
                        toast({ variant: 'destructive', title: 'Firestore Error', description: 'Could not save location.' });
                     }
                } finally {
                    setIsVerifying(false);
                }
            },
            (error) => {
                toast({ variant: 'destructive', title: 'Location Error', description: error.message });
                setIsVerifying(false);
                setPermissionStatus('denied');
            }
        );
    };

    if (isVerified) {
        return <>{children}</>;
    }

    return (
         <Dialog open={!isVerified} onOpenChange={() => {}}>
            <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()} hideCloseButton={true}>
                <DialogHeader>
                    <DialogTitle className="font-headline text-2xl">Location Required</DialogTitle>
                    <DialogDescription>
                        Please share your location to continue to the dashboard.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                     {permissionStatus === 'denied' ? (
                        <Alert variant="destructive">
                            <AlertTitle>Location Access Denied</AlertTitle>
                            <AlertDescription>
                            Please enable location permissions in your browser settings to use the app.
                            </AlertDescription>
                        </Alert>
                    ) : (
                         <div className="flex flex-col items-center justify-center text-center gap-4 p-4 rounded-lg bg-muted/50">
                            <MapPin className="w-12 h-12 text-primary" />
                            <p className="text-muted-foreground">We need to know your location to grant access.</p>
                        </div>
                    )}
                </div>
                <DialogFooter>
                     <Button
                        onClick={handleGetLocation}
                        disabled={isVerifying || permissionStatus === 'denied'}
                        className="w-full"
                    >
                        {isVerifying ? (
                            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Checking...</>
                        ) : (
                            <><MapPin className="mr-2 h-5 w-5" /> Share Location</>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
