
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Camera, RefreshCcw, UserPlus, Loader2, UserCheck, Clock } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Image from 'next/image';
import { format } from 'date-fns';

export default function FaceUploader() {
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);
    const [lastAccessImage, setLastAccessImage] = useState<string | null>(null);
    const [lastAccessTime, setLastAccessTime] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { toast } = useToast();
    
    useEffect(() => {
        const getCameraPermission = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setHasCameraPermission(true);
            } catch (error) {
                console.error('Error accessing camera:', error);
                setHasCameraPermission(false);
            }
        };
        getCameraPermission();

        const checkLastAccess = () => {
            const image = localStorage.getItem('lastAccessImage');
            const time = localStorage.getItem('lastAccessTime');
            setLastAccessImage(image);
            setLastAccessTime(time);
        }
        checkLastAccess();

        // Listen for storage changes from other tabs/windows
        window.addEventListener('storage', checkLastAccess);

        return () => {
            window.removeEventListener('storage', checkLastAccess);
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        }
    }, []);

    const handleCapture = useCallback(() => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/png');
                setCapturedImage(dataUrl);
            }
        }
    }, []);

    const handleSaveUser = () => {
        if (capturedImage) {
            setShowSaveConfirm(true);
        } else {
            toast({
                variant: 'destructive',
                title: 'No Image Captured',
                description: 'Please capture an image before saving.',
            });
        }
    };
    
    const confirmSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            if (capturedImage) {
                localStorage.setItem('authorizedUserFace', capturedImage);
                console.log("Saving user image to localStorage...");
            }
            setIsSaving(false);
            setCapturedImage(null);
            setShowSaveConfirm(false);
            toast({
                title: 'User Saved',
                description: 'The user\'s face has been registered successfully.'
            });
        }, 1500);
    }

    const resetCapture = () => {
        setCapturedImage(null);
    };

    return (
        <>
            <div className="space-y-8">
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">User Identity Validation</CardTitle>
                        <CardDescription>Capture and save a face photo for the authorized user.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-1">
                        <div className="aspect-video w-full rounded-lg bg-muted flex flex-col items-center justify-center gap-2 text-muted-foreground overflow-hidden relative">
                            {hasCameraPermission === null && <Loader2 className="w-12 h-12 animate-spin" />}
                            {hasCameraPermission === false && <p>Camera access denied.</p>}
                            
                            <video ref={videoRef} className={`w-full h-full object-cover ${capturedImage ? 'hidden' : 'block'}`} autoPlay muted playsInline />

                            {capturedImage && (
                                <Image src={capturedImage} alt="Captured face" fill className="object-cover" />
                            )}
                             <canvas ref={canvasRef} className="hidden"></canvas>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        {capturedImage ? (
                             <Button variant="outline" onClick={resetCapture}>
                                <RefreshCcw className="mr-2 h-4 w-4" />
                                Retake
                            </Button>
                        ) : (
                            <Button onClick={handleCapture} disabled={!hasCameraPermission}>
                                <Camera className="mr-2 h-4 w-4" />
                                Capture
                            </Button>
                        )}
                       
                        <Button onClick={handleSaveUser} disabled={!capturedImage || isSaving}>
                            {isSaving ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <UserPlus className="mr-2 h-4 w-4" />
                            )}
                            Save User
                        </Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                         <CardTitle className="font-headline text-2xl flex items-center gap-2"><UserCheck /> Last Project Access</CardTitle>
                        <CardDescription>Photo captured upon last successful project access.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {lastAccessImage ? (
                            <div className="space-y-4">
                                <div className="relative aspect-video w-full rounded-lg overflow-hidden border">
                                    <Image src={lastAccessImage} alt="Last access user" layout="fill" objectFit="cover" />
                                </div>
                                {lastAccessTime && (
                                    <div className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                                        <Clock size={16} />
                                        <span>{format(new Date(lastAccessTime), "MMM d, yyyy 'at' h:mm a")}</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                             <div className="aspect-video w-full rounded-lg bg-muted flex items-center justify-center">
                                <p className="text-muted-foreground">No access recorded yet.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>


             <AlertDialog open={showSaveConfirm} onOpenChange={setShowSaveConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Confirm New User</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to save this capture as the new authorized user? This will overwrite any existing user.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmSave}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Confirm & Save'}
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
