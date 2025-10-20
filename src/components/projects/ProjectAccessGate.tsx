
'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Camera, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { verifyFace } from '@/ai/flows/verify-face';

export default function ProjectAccessGate({ children }: { children: ReactNode }) {
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const checkVerification = () => {
      if (sessionStorage.getItem('projects-access-granted') === 'true') {
        setIsVerified(true);
      }
    };
    checkVerification();
  }, []);

  useEffect(() => {
    if (isVerified) return;

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
    
    return () => {
        if(videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    }
  }, [isVerified]);
  
  const handleVerification = async () => {
     if (!hasCameraPermission) {
        toast({
            variant: "destructive",
            title: "Camera Required",
            description: "Camera access is required to verify your identity."
        });
        return;
    }

    if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');

        if (context) {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const capturedImage = canvas.toDataURL('image/png');
            
            setIsVerifying(true);
            
            const storedUserImage = localStorage.getItem('authorizedUserFace');
            
            if (storedUserImage) {
                try {
                    const result = await verifyFace({
                        faceA: capturedImage,
                        faceB: storedUserImage
                    });

                    if (result.isMatch) {
                        sessionStorage.setItem('projects-access-granted', 'true');
                        localStorage.setItem('lastAccessImage', capturedImage);
                        localStorage.setItem('lastAccessTime', new Date().toISOString());
                        
                        setIsVerified(true);
                        toast({
                            title: "Access Granted",
                            description: "You can now view the projects.",
                        });
                    } else {
                        toast({
                            variant: "destructive",
                            title: "Verification Failed",
                            description: "Face not recognized.",
                        });
                    }
                } catch (error) {
                    console.error("Face verification error:", error);
                     toast({
                        variant: "destructive",
                        title: "AI Error",
                        description: "Could not verify face. Please try again later.",
                    });
                }
            } else {
                 toast({
                    variant: "destructive",
                    title: "Error",
                    description: "No authorized user registered. Cannot verify.",
                });
            }
            setIsVerifying(false);
        }
    }
  }


  if (isVerified) {
    return <>{children}</>;
  }

  return (
    <Dialog open={!isVerified} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()} hideCloseButton={true}>
            <DialogHeader>
            <DialogTitle className="font-headline text-2xl">Verification Required</DialogTitle>
            <DialogDescription>
                To access this section, please verify your identity by scanning your face.
            </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                    <canvas ref={canvasRef} className="hidden"></canvas>
                </div>
                 {hasCameraPermission === false && (
                    <Alert variant="destructive">
                        <AlertTitle>Camera Access Required</AlertTitle>
                        <AlertDescription>
                            Please allow camera access in your browser settings.
                        </AlartDescription>
                    </Alert>
                )}
            </div>
            <DialogFooter>
                <Button
                    className="w-full"
                    size="lg"
                    onClick={handleVerification}
                    disabled={isVerifying || hasCameraPermission !== true}
                >
                    {isVerifying ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Verifying...
                    </>
                    ) : (
                    <>
                        <Camera className="mr-2 h-5 w-5" />
                        Verify Identity
                    </>
                    )}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  );
}
