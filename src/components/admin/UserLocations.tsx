
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Loader2, MapPin, UserCircle } from 'lucide-react';
import type { User } from '@/lib/data';

export default function UserLocations() {
    const firestore = useFirestore();

    const usersQuery = useMemoFirebase(() =>
        firestore ? query(collection(firestore, 'users'), where('location', '!=', null)) : null,
        [firestore]
    );

    const { data: users, isLoading: areUsersLoading } = useCollection<User & {email: string, location: any}>(usersQuery);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">User Locations</CardTitle>
                <CardDescription>Last known locations of active users.</CardDescription>
            </CardHeader>
            <CardContent>
                {areUsersLoading && (
                    <div className="flex items-center justify-center p-8">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                )}
                {!areUsersLoading && users && users.length > 0 ? (
                    <div className="border rounded-lg">
                        <div className="min-w-[600px] divide-y">
                             <div className="grid grid-cols-[1fr_1fr_1fr] items-center p-2 gap-4 font-semibold text-muted-foreground">
                                <p>User Email</p>
                                <p>Latitude</p>
                                <p>Longitude</p>
                            </div>
                            {users.map(user => (
                                <div key={user.id} className="grid grid-cols-[1fr_1fr_1fr] items-center p-2 gap-4 hover:bg-muted/50">
                                    <p className="font-medium truncate flex items-center gap-2"><UserCircle className="w-4 h-4"/>{user.email}</p>
                                    <p className="text-sm text-muted-foreground">{user.location.latitude?.toFixed(6)}</p>
                                    <p className="text-sm text-muted-foreground">{user.location.longitude?.toFixed(6)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    !areUsersLoading && <p className="text-center py-8 text-muted-foreground">No user locations have been recorded yet.</p>
                )}
            </CardContent>
        </Card>
    );
}
