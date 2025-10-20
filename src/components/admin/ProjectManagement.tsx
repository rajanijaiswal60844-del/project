
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { useProjects } from "@/context/ProjectsContext";
import { useTasks } from "@/context/TasksContext";
import { useToast } from "@/hooks/use-toast";
import { initialTasks } from "@/lib/data";
import { initialProjects, labels as initialLabels } from "@/lib/data";

export default function ProjectManagement() {
    const { toast } = useToast();

    const handleReset = () => {
        // This is a bit of a hack, but it's the easiest way to reset the state
        // without reloading the page and exposing context setters.
        localStorage.setItem('projects', JSON.stringify(initialProjects));
        const allInitialLabels = initialProjects.flatMap(p => p.labels);
        const uniqueInitialLabels = [...new Set([...initialLabels, ...allInitialLabels])];
        localStorage.setItem('projectLabels', JSON.stringify(uniqueInitialLabels));
        localStorage.setItem('studyTasks', JSON.stringify(initialTasks));
        
        toast({
            title: "Data Reset",
            description: "All projects, labels, and tasks have been reset to their initial state. Please refresh the page.",
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Data Management</CardTitle>
                <CardDescription>Reset all application data to the default state.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    Warning: This action is irreversible and will delete all custom projects, labels, and tasks you have created.
                </p>
                 <Button variant="destructive" onClick={handleReset} className="w-full">
                    Reset All Data
                </Button>
            </CardContent>
        </Card>
    );
}
