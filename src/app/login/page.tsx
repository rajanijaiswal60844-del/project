
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Camera, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { verifyFace } from '@/ai/flows/verify-face';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Ensure user is logged out when they reach the login page
    localStorage.removeItem('isLoggedIn');

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
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to log in.',
        });
      }
    };

    getCameraPermission();
  }, [toast]);

  const handleLogin = async () => {
    if (!hasCameraPermission) {
        toast({
            variant: "destructive",
            title: "Camera Required",
            description: "Camera access is required to scan your face."
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
            
            setIsLoading(true);
            
            const storedUserImage = localStorage.getItem('authorizedUserFace');
            
            if (storedUserImage) {
                try {
                    console.log("Comparing scanned face with stored face...");
                    const result = await verifyFace({
                        faceA: capturedImage,
                        faceB: storedUserImage
                    });

                    if (result.isMatch) {
                        localStorage.setItem('isLoggedIn', 'true');
                        toast({
                            title: "Login Successful",
                            description: "Face recognized. Welcome back!",
                        });
                        router.push('/');
                    } else {
                        toast({
                            variant: "destructive",
                            title: "Login Failed",
                            description: "Face not recognized. Please try again.",
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
                    title: "Login Failed",
                    description: "No authorized user found. Please register in the admin panel.",
                });
            }
            setIsLoading(false);
        }
    } else {
         toast({
            variant: "destructive",
            title: "Capture Error",
            description: "Could not capture image from camera.",
        });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-blue-100">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
             <Camera className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="font-headline text-3xl">FaceFilter AI</CardTitle>
          <CardDescription>
            Securely access your dashboard by scanning your face.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
            <canvas ref={canvasRef} className="hidden"></canvas>
          </div>
          {hasCameraPermission === false && (
             <Alert variant="destructive">
                <AlertTitle>Camera Access Required</AlertTitle>
                <AlertDescription>
                    Please allow camera access in your browser settings to use this feature.
                </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            size="lg"
            onClick={handleLogin}
            disabled={isLoading || hasCameraPermission === null}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Camera className="mr-2 h-5 w-5" />
                Scan Face to Login
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
