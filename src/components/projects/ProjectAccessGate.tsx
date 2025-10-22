
'use client';

import { useState, useRef, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Camera, Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { verifyFace } from '@/ai/flows/verify-face';
import { useUser, useFirestore, errorEmitter } from '@/firebase';
import { addDoc, collection, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { FirestorePermissionError } from '@/firebase/errors';

const VERIFICATION_TIMEOUT = 2 * 60 * 1000; // 2 minutes

export default function ProjectAccessGate({ children }: { children: ReactNode }) {
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();

  const getCameraPermission = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    const lastVerificationTime = sessionStorage.getItem('projectVerificationTime');
    if (lastVerificationTime && (Date.now() - parseInt(lastVerificationTime, 10)) < VERIFICATION_TIMEOUT) {
        setIsVerified(true);
    } else {
        getCameraPermission();
    }
    
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [getCameraPermission]);
  
  const getAuthorizedUserImage = async (): Promise<string | null> => {
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Database not available' });
      return null;
    }

    try {
        const configRef = doc(firestore, 'systemConfig', 'authorizedUser');
        const docSnap = await getDoc(configRef);

        if (docSnap.exists() && docSnap.data().faceDataUrl) {
            return docSnap.data().faceDataUrl;
        }
        return null;
    } catch (error) {
        console.error("Error fetching authorized user from Firestore:", error);
        toast({ variant: 'destructive', title: 'Error fetching user data' });
        return null;
    }
  }

  const handleVerification = async () => {
    if (!hasCameraPermission || !user) {
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
        
        const storedUserImage = await getAuthorizedUserImage();
        
        if (storedUserImage) {
          try {
            const result = await verifyFace({
              faceA: capturedImage,
              faceB: storedUserImage
            });

            if (result.isMatch) {
              sessionStorage.setItem('projectVerificationTime', Date.now().toString());
              
              // Log the verification event timestamp
              const newRecord = { timestamp: Date.now() };
              const existingRecordsRaw = localStorage.getItem('verificationRecords');
              const existingRecords = existingRecordsRaw ? JSON.parse(existingRecordsRaw) : [];
              existingRecords.push(newRecord);
              localStorage.setItem('verificationRecords', JSON.stringify(existingRecords));

              // Save the captured image to the global userPhotos collection
              const userPhotosCol = collection(firestore, 'userPhotos');
              const username = localStorage.getItem('chatUsername') || 'Anonymous';
              const photoDoc = {
                  userId: user.uid,
                  userName: `${username} (Verified)`,
                  fileName: `verification-scan-${Date.now()}.png`,
                  downloadUrl: capturedImage,
                  uploadDate: serverTimestamp(),
              };
               await addDoc(userPhotosCol, photoDoc).catch((serverError) => {
                  const permissionError = new FirestorePermissionError({
                    path: userPhotosCol.path,
                    operation: 'create',
                    requestResourceData: photoDoc,
                  });
                  errorEmitter.emit('permission-error', permissionError);
                  throw serverError;
              });
              
              setIsVerified(true);
              toast({
                title: "Access Granted",
                description: "Verification successful. Photo saved to admin panel.",
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
            if (!(error instanceof FirestorePermissionError)) {
              toast({
                variant: "destructive",
                title: "AI Error",
                description: "Could not verify face. Please try again later.",
              });
            }
          }
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "No authorized user registered. Please set one in the Admin Panel.",
          });
        }
        setIsVerifying(false);
      }
    }
  };

  if (isVerified) {
    return <>{children}</>;
  }

  return (
    <>
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
              {hasCameraPermission === null && <Loader2 className="w-12 h-12 animate-spin text-muted-foreground" />}
              <video ref={videoRef} className={`w-full h-full object-cover ${hasCameraPermission === false ? 'hidden' : 'block'}`} autoPlay muted playsInline />
              <canvas ref={canvasRef} className="hidden"></canvas>
            </div>
            {hasCameraPermission === false && (
              <Alert variant="destructive">
                <AlertTitle>Camera Access Denied</AlertTitle>
                <AlertDescription>
                  Please enable camera permissions in your browser settings.
                </AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={() => router.push('/')}
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back
            </Button>
            <Button
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
                  Verify
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
