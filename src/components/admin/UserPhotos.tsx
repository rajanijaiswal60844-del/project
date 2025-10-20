
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, Timestamp } from 'firebase/firestore';
import { Loader2, UserCircle } from 'lucide-react';
import Image from 'next/image';
import ImagePreviewDialog from '../common/ImagePreviewDialog';
import { formatDistanceToNow } from 'date-fns';

interface UserPhoto {
    id: string;
    userId: string;
    userName: string;
    fileName: string;
    downloadUrl: string;
    uploadDate: Timestamp;
}

const formatTimestamp = (ts: Timestamp | null | undefined) => {
    if (!ts) return 'Unknown date';
    return formatDistanceToNow(ts.toDate(), { addSuffix: true });
}

export default function UserPhotos() {
    const firestore = useFirestore();
    const [imageToPreview, setImageToPreview] = useState<string | null>(null);

    const photosQuery = useMemoFirebase(() =>
        firestore ? query(collection(firestore, 'userPhotos'), orderBy('uploadDate', 'desc')) : null,
        [firestore]
    );

    const { data: photos, isLoading: arePhotosLoading } = useCollection<UserPhoto>(photosQuery);

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">User Photos</CardTitle>
                    <CardDescription>A gallery of all images uploaded by users.</CardDescription>
                </CardHeader>
                <CardContent>
                    {arePhotosLoading && (
                        <div className="flex items-center justify-center p-8">
                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                        </div>
                    )}
                    {!arePhotosLoading && photos && photos.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {photos.map(photo => (
                                <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-lg shadow-md">
                                    <Image
                                        src={photo.downloadUrl}
                                        alt={photo.fileName}
                                        fill
                                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                                    />
                                    <div
                                        className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2 cursor-pointer"
                                        onClick={() => setImageToPreview(photo.downloadUrl)}
                                    >
                                        <p className="text-white text-xs font-bold truncate">{photo.fileName}</p>
                                        <p className="text-white/80 text-xs flex items-center gap-1">
                                            <UserCircle className="w-3 h-3" />
                                            {photo.userName}
                                        </p>
                                        <p className="text-white/80 text-xs">{formatTimestamp(photo.uploadDate)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        !arePhotosLoading && <p className="text-center py-8 text-muted-foreground">No user photos have been uploaded yet.</p>
                    )}
                </CardContent>
            </Card>

            <ImagePreviewDialog
                isOpen={!!imageToPreview}
                onOpenChange={(open) => !open && setImageToPreview(null)}
                imageUrl={imageToPreview}
                altText="User Photo Preview"
            />
        </>
    );
}
