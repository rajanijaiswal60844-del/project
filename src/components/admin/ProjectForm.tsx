
'use client';

import { useState, FormEvent, useEffect, useRef, ChangeEvent } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { useProjects } from "@/context/ProjectsContext";
import { useToast } from "@/hooks/use-toast";
import type { Project } from "@/lib/data";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { Card } from "../ui/card";

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
    const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (existingProject) {
            setName(existingProject.name);
            setDescription(existingProject.description);
            setLabels(existingProject.labels.join(', '));
            setImageDataUrl(existingProject.imageUrl);
        } else {
            // Reset form
            setName('');
            setDescription('');
            setLabels('');
            setImageDataUrl(null);
        }
    }, [existingProject, isOpen]);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUrl = e.target?.result as string;
                setImageDataUrl(dataUrl);
            };
            reader.readAsDataURL(file);
        }
    };

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
            imageUrl: imageDataUrl || `https://picsum.photos/seed/${Date.now()}/600/400`,
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
                        <Label>Project Image</Label>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                        <Card 
                            className="aspect-video w-full flex items-center justify-center border-dashed hover:border-primary hover:text-primary transition-colors cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {imageDataUrl ? (
                                <div className="relative w-full h-full">
                                    <Image src={imageDataUrl} alt="Project preview" fill className="object-cover rounded-lg" />
                                     <Button 
                                        type="button"
                                        variant="destructive" 
                                        size="icon" 
                                        className="absolute top-2 right-2 h-7 w-7"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setImageDataUrl(null);
                                        }}
                                     >
                                        <X className="h-4 w-4" />
                                     </Button>
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground">
                                    <Upload className="mx-auto h-8 w-8 mb-2" />
                                    <p>Click to upload an image</p>
                                    <p className="text-xs">PNG, JPG, etc. up to 1MB</p>
                                </div>
                            )}
                        </Card>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="projectLabels">Labels (comma-separated)</Label>
                        <Input id="projectLabels" placeholder="e.g., UI/UX, Frontend" value={labels} onChange={e => setLabels(e.target.value)} />
                    </div>
                    
                    <DialogFooter>
                        <Button type="submit">{existingProject ? 'Save Changes' : 'Add Project'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
