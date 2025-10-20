'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, AuthErrorCodes, signInWithCredential, EmailAuthProvider } from "firebase/auth";
import { useRouter }from 'next/navigation';
import { useUser } from '@/firebase';
import { Camera, Loader2, RefreshCcw, LogIn, UserPlus } from 'lucide-react';
import { verifyFace } from '@/ai/flows/verify-face';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const { toast } = useToast();
  const router = useRouter();
  const auth = getAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if(!isUserLoading && user) {
      router.replace('/');
    }
  }, [user, isUserLoading, router])
  
  const getCameraPermission = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    getCameraPermission();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [getCameraPermission]);

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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ variant: "destructive", title: "Missing fields" });
      return;
    }
    if (!capturedImage) {
        toast({ variant: "destructive", title: "Face scan required", description: "Please capture your face for login." });
        return;
    }
    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store the captured face image in a 'user_faces' collection in Firestore
      const userFaceRef = doc(firestore, 'user_faces', user.uid);
      await setDoc(userFaceRef, { faceImage: capturedImage, email: user.email });

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

  const handleFaceScanLogin = async () => {
    if (!capturedImage) {
      toast({ variant: "destructive", title: "No image", description: "Please capture an image first." });
      return;
    }
     if (!email) {
      toast({ variant: "destructive", title: "Email required", description: "Please enter your email to find your profile." });
      return;
    }
    setIsScanning(true);

    try {
        // 1. Fetch the user's stored face from Firestore using their email
        const userFaceRef = doc(firestore, 'user_faces', email); // Assuming doc id is user's email
        const userFaceSnap = await getDoc(userFaceRef);

        if (!userFaceSnap.exists()) {
             // For flexibility, let's try finding user by UID if email is used as UID in some cases
             const userFaceRefByUid = doc(firestore, 'user_faces', email);
             const userFaceSnapByUid = await getDoc(userFaceRefByUid);
             if(!userFaceSnapByUid.exists()) {
                toast({ variant: "destructive", title: "No profile found", description: "No user profile found for this email." });
                setIsScanning(false);
                return;
             }
        }
        
        // This is a workaround, in a real app you would query by email field
        const allUsersRef = collection(firestore, 'user_faces');
        const q = query(allUsersRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            toast({ variant: "destructive", title: "No profile found", description: "No user profile found for this email." });
            setIsScanning(false);
            return;
        }

        const userDoc = querySnapshot.docs[0];
        const storedFaceData = userDoc.data();
        const storedFaceImage = storedFaceData.faceImage;

      // 2. Call AI to verify faces
      const result = await verifyFace({ faceA: capturedImage, faceB: storedFaceImage });

      if (result.isMatch) {
         // 3. If match, sign the user in.
         // This is a simplified login. In a real app, you'd use a more secure custom token system.
         // For this demo, we'll use the user's password from a prompt, or you'd have another mechanism.
         const userPassword = prompt("Face recognized! Please enter your password to complete login.");
         if (userPassword) {
            await signInWithEmailAndPassword(auth, email, userPassword);
            toast({ title: "Login Successful", description: "Welcome back!" });
            router.push('/');
         } else {
            toast({ variant: 'destructive', title: 'Password required' });
         }
      } else {
        toast({ variant: "destructive", title: "Face not recognized" });
      }
    } catch (error) {
        console.error("Face scan login error:", error);
        toast({ variant: "destructive", title: "Login Error", description: "An error occurred during face scan login." });
    } finally {
        setIsScanning(false);
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
                 <div className="aspect-video w-full rounded-lg bg-muted flex items-center justify-center text-muted-foreground overflow-hidden relative">
                    {!capturedImage ? (
                        <>
                            <video ref={videoRef} className={`w-full h-full object-cover ${hasCameraPermission === false ? 'hidden' : 'block'}`} autoPlay muted playsInline />
                            <canvas ref={canvasRef} className="hidden" />
                            {hasCameraPermission === false && <p>Camera access denied.</p>}
                        </>
                    ) : (
                         <Image src={capturedImage} alt="Captured face" fill className="object-cover" />
                    )}
                 </div>
                 <div className="flex gap-2">
                    <Button type="button" variant="outline" className="w-full" onClick={handleCapture} disabled={!hasCameraPermission || !!capturedImage}>
                        <Camera className="mr-2 h-4 w-4" /> Capture
                    </Button>
                    <Button type="button" variant="secondary" className="w-full" onClick={() => setCapturedImage(null)} disabled={!capturedImage}>
                        <RefreshCcw className="mr-2 h-4 w-4" /> Retake
                    </Button>
                 </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading || !capturedImage}>
                    {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : <><UserPlus className="mr-2 h-4 w-4" />Sign Up</>}
                </Button>
            </form>
        )
    }

    return (
         <div className="space-y-4">
             <div className="aspect-video w-full rounded-lg bg-muted flex items-center justify-center text-muted-foreground overflow-hidden relative">
                {!capturedImage ? (
                    <>
                        <video ref={videoRef} className={`w-full h-full object-cover ${hasCameraPermission === false ? 'hidden' : 'block'}`} autoPlay muted playsInline />
                        <canvas ref={canvasRef} className="hidden" />
                         {hasCameraPermission === false && <p>Camera access denied.</p>}
                    </>
                ) : (
                     <Image src={capturedImage} alt="Captured face" fill className="object-cover" />
                )}
             </div>
             <div className="flex gap-2">
                <Button variant="outline" className="w-full" onClick={handleCapture} disabled={!hasCameraPermission || !!capturedImage}>
                    <Camera className="mr-2 h-4 w-4" /> Capture
                </Button>
                <Button variant="secondary" className="w-full" onClick={() => setCapturedImage(null)} disabled={!capturedImage}>
                    <RefreshCcw className="mr-2 h-4 w-4" /> Retake
                </Button>
             </div>
              <div className="space-y-2">
                <Label htmlFor="email-login">Email</Label>
                <Input id="email-login" type="email" placeholder="Enter your email to scan" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isScanning} />
              </div>
            <Button onClick={handleFaceScanLogin} className="w-full" disabled={isScanning || !capturedImage || !email}>
                {isScanning ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Scanning...</> : <><LogIn className="mr-2 h-4 w-4" />Sign In with Face</>}
            </Button>
        </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-blue-100 p-4">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">Project</CardTitle>
          <CardDescription>
            {isSignUp ? 'Create an account with your face' : 'Sign in with your face'}
          </CardDescription>
        </CardHeader>
        <CardContent>
            {renderContent()}
        </CardContent>
        <CardFooter className="pt-4 text-center text-sm">
          <Button variant="link" onClick={() => setIsSignUp(!isSignUp)} disabled={isLoading || isScanning}>
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
