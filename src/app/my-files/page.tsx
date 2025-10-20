
'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Upload, Trash2, File as FileIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';
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
import type { UserFile } from '@/lib/data';
import MyFilesGate from '@/components/my-files/MyFilesGate';
import ImagePreviewDialog from '@/components/common/ImagePreviewDialog';

export default function MyFilesPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<UserFile | null>(null);
  const [imageToPreview, setImageToPreview] = useState<string | null>(null);

  const filesQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'files') : null),
    [user, firestore]
  );
  const { data: files, isLoading: areFilesLoading } = useCollection<UserFile>(filesQuery);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && user) {
      setIsUploading(true);
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const dataUrl = e.target?.result as string;
          const filesCol = collection(firestore, 'users', user.uid, 'files');
          
          const fileDoc = {
            fileName: file.name,
            fileType: file.type,
            uploadDate: serverTimestamp(),
            fileSize: file.size,
            downloadUrl: dataUrl,
          };
          
          // Save to user's private collection
          await addDoc(filesCol, fileDoc);

          // If it's an image, also save to the global collection
          if (file.type.startsWith('image/')) {
            const userPhotosCol = collection(firestore, 'userPhotos');
            const username = localStorage.getItem('chatUsername') || 'Anonymous';
            await addDoc(userPhotosCol, {
                userId: user.uid,
                userName: username,
                fileName: file.name,
                downloadUrl: dataUrl,
                uploadDate: serverTimestamp(),
            });
          }

          toast({
            title: 'File Uploaded',
            description: `${file.name} has been saved.`,
          });
        } catch (error) {
          console.error('Error uploading file:', error);
          toast({
            variant: 'destructive',
            title: 'Upload Failed',
            description: 'Could not save the file to the database.',
          });
        } finally {
          setIsUploading(false);
        }
      };
      
      reader.onerror = () => {
        toast({
            variant: 'destructive',
            title: 'File Error',
            description: 'Could not read the selected file.'
        });
        setIsUploading(false);
      }
      reader.readAsDataURL(file);
    }
    if(event.target) {
        event.target.value = '';
    }
  };
  
  const handleDeleteFile = async () => {
    if (fileToDelete && user) {
        const fileRef = doc(firestore, 'users', user.uid, 'files', fileToDelete.id);
        try {
            await deleteDoc(fileRef);
            toast({
                title: 'File Deleted',
                description: `${fileToDelete.fileName} has been removed.`,
            });
            // Note: This does not delete from the global `userPhotos` collection.
            // A cloud function would be needed for more robust synchronization.
        } catch (error) {
             toast({
                variant: 'destructive',
                title: 'Deletion Failed',
                description: 'Could not delete the file.',
            });
             console.error('Error deleting file:', error);
        } finally {
            setFileToDelete(null);
        }
    }
  }


  return (
    <MyFilesGate>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-headline font-bold text-foreground">My Files</h1>
          <p className="text-muted-foreground mt-2">
            A secure place for your favorite files.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload a New File</CardTitle>
            <CardDescription>Files are stored securely and are only accessible by you.</CardDescription>
          </CardHeader>
          <CardContent>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <Button onClick={handleUploadClick} disabled={isUploading}>
              {isUploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              {isUploading ? 'Uploading...' : 'Choose File'}
            </Button>
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Your Uploaded Files</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg">
                    <div className="min-w-[600px] divide-y">
                        {areFilesLoading && (
                            <div className="flex justify-center items-center p-8 text-muted-foreground">
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                <span>Loading files...</span>
                            </div>
                        )}
                        {!areFilesLoading && files && files.length > 0 ? (
                            files.map(file => (
                                <div key={file.id} className="grid grid-cols-[60px_1fr_100px_120px_50px] items-center p-2 gap-4 hover:bg-muted/50">
                                    <div className="flex items-center justify-center">
                                       {file.fileType.startsWith('image/') ? (
                                            <div 
                                                className="relative w-10 h-10 rounded-md overflow-hidden cursor-pointer"
                                                onClick={() => setImageToPreview(file.downloadUrl)}
                                            >
                                                <Image src={file.downloadUrl} alt={file.fileName} fill className="object-cover" />
                                            </div>
                                       ) : (
                                            <FileIcon className="w-8 h-8 text-muted-foreground" />
                                       )}
                                    </div>
                                    <p className="font-medium truncate">{file.fileName}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {(file.fileSize / 1024).toFixed(2)} KB
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {file.uploadDate ? new Date(file.uploadDate.toDate()).toLocaleDateString() : 'Just now'}
                                    </p>
                                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => setFileToDelete(file)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))
                        ) : (
                            !areFilesLoading && <p className="p-8 text-center text-muted-foreground">You haven't uploaded any files yet.</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>

      </div>
      
       <AlertDialog open={!!fileToDelete} onOpenChange={(open) => !open && setFileToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This will permanently delete the file "{fileToDelete?.fileName}". This action cannot be undone.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteFile} className="bg-destructive hover:bg-destructive/90">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        <ImagePreviewDialog
            isOpen={!!imageToPreview}
            onOpenChange={(open) => !open && setImageToPreview(null)}
            imageUrl={imageToPreview}
            altText="File Preview"
        />
    </MyFilesGate>
  );
}
