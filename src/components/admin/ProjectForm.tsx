'use client';

import { useState, FormEvent } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { useProjects } from "@/context/ProjectsContext";
import { useToast } from "@/hooks/use-toast";
import type { Project } from "@/lib/data";

export default function ProjectForm() {
    const { addProject } = useProjects();
    const { toast } = useToast();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [labels, setLabels] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if(!name || !description) {
            toast({
                variant: 'destructive',
                title: 'Missing Fields',
                description: 'Project Name and Description are required.'
            });
            return;
        }

        const newProject: Project = {
            id: `proj-${Date.now()}`,
            name,
            description,
            labels: labels.split(',').map(l => l.trim()).filter(Boolean),
            imageUrl: imageUrl || `https://picsum.photos/seed/${Date.now()}/600/400`,
            imageHint: 'custom project'
        };

        addProject(newProject);

        toast({
            title: 'Project Added',
            description: `"${name}" has been successfully added.`
        });
        
        // Reset form
        setName('');
        setDescription('');
        setLabels('');
        setImageUrl('');
    }

    return (
        <Card>
            <form onSubmit={handleSubmit}>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Manage Projects</CardTitle>
                    <CardDescription>Add a new project to the dashboard.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="projectName">Project Name</Label>
                        <Input id="projectName" placeholder="e.g., Aura UI Redesign" value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="projectDescription">Description</Label>
                        <Textarea id="projectDescription" placeholder="Describe the project..." value={description} onChange={e => setDescription(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="projectLabels">Labels (comma-separated)</Label>
                        <Input id="projectLabels" placeholder="e.g., UI/UX, Frontend" value={labels} onChange={e => setLabels(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="projectImage">Image URL (Optional)</Label>
                        <Input id="projectImage" placeholder="https://example.com/image.png" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full">Add Project</Button>
                </CardFooter>
            </form>
        </Card>
    );
}
