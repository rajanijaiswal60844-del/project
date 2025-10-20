
'use client';

import { useState, FormEvent, useEffect, useRef, ChangeEvent } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { useProjects } from "@/context/ProjectsContext";
import { useToast } from "@/hooks/use-toast";
import type { Project, Comment } from "@/lib/data";
import Image from "next/image";
import { Upload, X, MessageSquare, Send } from "lucide-react";
import { Card } from "../ui/card";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { formatDistanceToNow } from 'date-fns';

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
    const [rate, setRate] = useState<number | string>('');
    const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [username, setUsername] = useState('User');

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      const savedUsername = localStorage.getItem('chatUsername');
      if(savedUsername) setUsername(savedUsername);
    }, []);

    useEffect(() => {
        if (existingProject) {
            setName(existingProject.name);
            setDescription(existingProject.description);
            setLabels(existingProject.labels.join(', '));
            setRate(existingProject.rate ?? '');
            setImageDataUrl(existingProject.imageUrl);
            setComments(existingProject.comments || []);
        } else {
            // Reset form
            setName('');
            setDescription('');
            setLabels('');
            setRate('');
            setImageDataUrl(null);
            setComments([]);
        }
        setNewComment('');
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

    const handleAddComment = () => {
      if (newComment.trim() === '') return;

      const comment: Comment = {
        id: `comment-${Date.now()}`,
        text: newComment,
        author: username,
        timestamp: Date.now(),
      }
      setComments(prev => [...prev, comment]);
      setNewComment('');
    }

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
            rate: Number(rate) || undefined,
            imageUrl: imageDataUrl || `https://picsum.photos/seed/${Date.now()}/600/400`,
            imageHint: 'custom project',
            comments
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
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{existingProject ? 'Edit Project' : 'Add New Project'}</DialogTitle>
                    <DialogDescription>Fill in the details for your project.</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto pr-2">
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
                                className="aspect-video w-full flex items-center justify-center border-dashed hover:border-primary hover:text-primary transition-colors cursor-pointer bg-muted/20"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {imageDataUrl ? (
                                    <div className="relative w-full h-full">
                                        <Image src={imageDataUrl} alt="Project preview" fill className="object-contain rounded-lg" />
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
                                        <p className="text-xs">PNG, JPG, etc.</p>
                                    </div>
                                )}
                            </Card>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="projectLabels">Labels (comma-separated)</Label>
                            <Input id="projectLabels" placeholder="e.g., UI/UX, Frontend" value={labels} onChange={e => setLabels(e.target.value)} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="projectRate">Rate ($/hr or fixed)</Label>
                            <Input id="projectRate" type="number" placeholder="e.g., 150" value={rate} onChange={e => setRate(e.target.value)} />
                        </div>
                    </form>
                    
                    <div className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2"><MessageSquare className="w-5 h-5"/> Comments</h3>
                         <div className="space-y-4 pr-4">
                            {comments.length > 0 ? (
                                comments.map(comment => (
                                    <div key={comment.id} className="flex gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback>{comment.author.charAt(0).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex items-baseline gap-2">
                                                <p className="font-semibold text-sm">{comment.author}</p>
                                                <p className="text-xs text-muted-foreground">{formatDistanceToNow(comment.timestamp, { addSuffix: true })}</p>
                                            </div>
                                            <p className="text-sm bg-muted/50 rounded-lg p-2">{comment.text}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">No comments yet.</p>
                            )}
                        </div>
                        <div className="relative">
                            <Textarea 
                                placeholder="Write a comment..." 
                                value={newComment} 
                                onChange={e => setNewComment(e.target.value)}
                                className="pr-12"
                            />
                            <Button size="icon" className="absolute right-2 top-2 h-8 w-8" onClick={handleAddComment} disabled={!newComment.trim()}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button type="button" onClick={handleSubmit}>{existingProject ? 'Save Changes' : 'Add Project'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
