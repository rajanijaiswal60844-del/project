
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";
import { useProjects } from "@/context/ProjectsContext";

export default function DataManagement() {
    const { toast } = useToast();
    const { projects, labels, deleteProject, deleteLabel } = useProjects();

    const handleReset = () => {
        // This now needs to delete from Firestore
        toast({
            title: "Clearing Data...",
            description: "Requesting deletion of all projects and labels.",
        });

        const projectDeletions = projects.map(p => deleteProject(p.id));
        const labelDeletions = labels.map(l => deleteLabel(l.id));

        Promise.all([...projectDeletions, ...labelDeletions]).then(() => {
            toast({
                title: "Data Reset",
                description: "All projects and labels have been deleted.",
            });
        }).catch(error => {
             toast({
                variant: "destructive",
                title: "Deletion Failed",
                description: "Could not delete all data. Please try again.",
            });
            console.error("Data reset failed:", error);
        })
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Data Management</CardTitle>
                <CardDescription>Reset all application data to the default state.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    Warning: This action is irreversible and will permanently delete all projects and labels for all users.
                </p>
                 <Button variant="destructive" onClick={handleReset} className="w-full">
                    Reset All Data
                </Button>
            </CardContent>
        </Card>
    );
}
