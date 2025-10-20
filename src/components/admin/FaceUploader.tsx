import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Camera, Upload } from "lucide-react";

export default function FaceUploader() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">User Identity Validation</CardTitle>
                <CardDescription>Capture and upload face photos for new users.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="aspect-video w-full rounded-lg bg-muted flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Camera className="w-12 h-12" />
                    <p>Live Camera Placeholder</p>
                </div>
                 <div className="flex items-center gap-2">
                    <Input id="face-upload" type="file" className="flex-1" />
                    <Button size="icon" variant="outline">
                        <Upload className="h-4 w-4"/>
                        <span className="sr-only">Upload file</span>
                    </Button>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button variant="outline">Capture</Button>
                <Button>Save User</Button>
            </CardFooter>
        </Card>
    )
}
