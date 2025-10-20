'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Camera, RefreshCcw, UserPlus, Loader2 } from "lucide-react";
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

export default function FaceUploader() {
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);
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
        // Simulate saving to a database
        setTimeout(() => {
            // In a real app, you would save the capturedImage (data URL) to your backend.
            console.log("Saving user image...");
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
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">User Identity Validation</CardTitle>
                    <CardDescription>Capture and save face photos for new users to enable login.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="aspect-video w-full rounded-lg bg-muted flex flex-col items-center justify-center gap-2 text-muted-foreground overflow-hidden relative">
                        {hasCameraPermission === null && <Loader2 className="w-12 h-12 animate-spin" />}
                        {hasCameraPermission === false && <p>Camera access denied.</p>}
                        
                        <video ref={videoRef} className={`w-full h-full object-cover ${capturedImage ? 'hidden' : 'block'}`} autoPlay muted playsInline />

                        {capturedImage && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={capturedImage} alt="Captured face" className="w-full h-full object-cover" />
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

             <AlertDialog open={showSaveConfirm} onOpenChange={setShowSaveConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Confirm New User</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to save this capture as a new authorized user? This action cannot be undone.
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
