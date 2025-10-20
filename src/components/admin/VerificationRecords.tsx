
'use client';

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { UserCheck } from "lucide-react";

export default function VerificationRecords() {
    const [recordCount, setRecordCount] = useState(0);

    useEffect(() => {
        const storedRecords = localStorage.getItem('verificationRecords');
        if (storedRecords) {
            try {
                const records = JSON.parse(storedRecords);
                setRecordCount(Array.isArray(records) ? records.length : 0);
            } catch (e) {
                setRecordCount(0);
            }
        }
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Verification Records</CardTitle>
                <CardDescription>The total number of successful face verifications.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
                <div className="bg-primary/10 p-4 rounded-lg">
                    <UserCheck className="w-8 h-8 text-primary" />
                </div>
                <div>
                    <p className="text-4xl font-bold">{recordCount}</p>
                    <p className="text-muted-foreground">Successful Verifications</p>
                </div>
            </CardContent>
        </Card>
    );
}
