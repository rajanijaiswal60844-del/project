
'use client';

import { useState, FormEvent, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { useProjects } from "@/context/ProjectsContext";
import { useToast } from "@/hooks/use-toast";
import type { Project } from "@/lib/data";

interface ProjectFormProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    existingProject?: Project | null;
}

export default function ProjectForm({ isOpen, setIsOpen, existingProject }: ProjectFormProps) {
    const { addProject, updateProject } = useProjects();
    const { toast } = useToast();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [labels, setLabels] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    useEffect(() => {
        if (existingProject) {
            setName(existingProject.name);
            setDescription(existingProject.description);
            setLabels(existingProject.labels.join(', '));
            setImageUrl(existingProject.imageUrl);
        } else {
            setName('');
            setDescription('');
            setLabels('');
            setImageUrl('');
        }
    }, [existingProject, isOpen]);

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

        const projectData = {
            name,
            description,
            labels: labels.split(',').map(l => l.trim()).filter(Boolean),
            imageUrl: imageUrl || `https://picsum.photos/seed/${Date.now()}/600/400`,
            imageHint: 'custom project'
        };

        if (existingProject) {
            updateProject({ ...existingProject, ...projectData });
            toast({
                title: 'Project Updated',
                description: `"${name}" has been successfully updated.`
            });
        } else {
            const newProject: Project = {
                id: `proj-${Date.now()}`,
                ...projectData
            };
            addProject(newProject);
            toast({
                title: 'Project Added',
                description: `"${name}" has been successfully added.`
            });
        }
        
        setIsOpen(false);
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{existingProject ? 'Edit Project' : 'Add New Project'}</DialogTitle>
                    <DialogDescription>Fill in the details for your project.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                        <Input id="projectImage" placeholder="https://picsum.photos/seed/..." value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
                    </div>
                    <DialogFooter>
                        <Button type="submit">{existingProject ? 'Save Changes' : 'Add Project'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
