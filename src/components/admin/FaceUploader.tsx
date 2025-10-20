
'use client';

import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Camera, RefreshCcw, UserPlus, Loader2, Upload } from "lucide-react";
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

export default function FaceUploader() {
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    
    useEffect(() => {
        const getCameraPermission = async () => {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
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
            } else {
                 setHasCameraPermission(false);
            }
        };
        getCameraPermission();

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        }
    }, []);

    const handleCapture = () => {
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
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUrl = e.target?.result as string;
                setCapturedImage(dataUrl);
            };
            reader.onerror = () => {
                toast({
                    variant: 'destructive',
                    title: 'File Error',
                    description: 'Could not read the selected file.'
                });
            }
            reader.readAsDataURL(file);
        }
        event.target.value = '';
    };

    const handleSaveUser = () => {
        if (capturedImage) {
            setShowSaveConfirm(true);
        } else {
            toast({
                variant: 'destructive',
                title: 'No Image Captured',
                description: 'Please capture or upload an image before saving.',
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
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">User Identity Validation</CardTitle>
                    <CardDescription>Capture or upload a face photo for the authorized user.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="aspect-video w-full rounded-lg bg-muted flex flex-col items-center justify-center gap-2 text-muted-foreground overflow-hidden relative">
                        {hasCameraPermission === null && <Loader2 className="w-12 h-12 animate-spin" />}
                        {hasCameraPermission === false && !capturedImage && <p>Camera access denied.</p>}
                        
                        <video ref={videoRef} className={`w-full h-full object-cover ${capturedImage || hasCameraPermission === false ? 'hidden' : 'block'}`} autoPlay muted playsInline />

                        {capturedImage && (
                            <Image src={capturedImage} alt="Captured face" fill className="object-cover" />
                        )}
                            <canvas ref={canvasRef} className="hidden"></canvas>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    {capturedImage ? (
                            <Button variant="outline" onClick={resetCapture}>
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            Retake
                        </Button>
                    ) : (
                        <>
                            <Button onClick={handleCapture} disabled={!hasCameraPermission}>
                                <Camera className="mr-2 h-4 w-4" />
                                Capture
                            </Button>
                            <Button variant="outline" onClick={handleUploadClick}>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload
                            </Button>
                        </>
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
