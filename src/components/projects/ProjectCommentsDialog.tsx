
'use client';

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useProjects } from "@/context/ProjectsContext";
import type { Project, Comment } from "@/lib/data";
import { Send, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { formatDistanceToNow } from 'date-fns';

interface ProjectCommentsDialogProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    project: Project | null;
}

export default function ProjectCommentsDialog({ isOpen, setIsOpen, project }: ProjectCommentsDialogProps) {
    const { updateProject } = useProjects();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [username, setUsername] = useState('User');

    useEffect(() => {
      const savedUsername = localStorage.getItem('chatUsername');
      if(savedUsername) setUsername(savedUsername);
    }, []);

    useEffect(() => {
        if (project) {
            setComments(project.comments || []);
        }
        setNewComment('');
    }, [project, isOpen]);

    const handleAddComment = () => {
      if (newComment.trim() === '' || !project) return;

      const comment: Comment = {
        id: `comment-${Date.now()}`,
        text: newComment,
        author: username,
        timestamp: Date.now(),
      }
      const updatedComments = [...comments, comment];
      setComments(updatedComments);
      updateProject({ ...project, comments: updatedComments });
      setNewComment('');
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MessageSquare className="w-6 h-6" /> Comments for "{project?.name}"
                    </DialogTitle>
                    <DialogDescription>
                        View and add comments for this project.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-4">
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
                        <p className="text-sm text-muted-foreground text-center py-8">No comments yet. Be the first to comment!</p>
                    )}
                </div>
                
                <div className="relative pt-4">
                    <Textarea 
                        placeholder="Write a comment..." 
                        value={newComment} 
                        onChange={e => setNewComment(e.target.value)}
                        className="pr-12"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleAddComment();
                            }
                        }}
                    />
                    <Button size="icon" className="absolute right-2 top-6 h-8 w-8" onClick={handleAddComment} disabled={!newComment.trim()}>
                        <Send className="h-4 w-4" />
                    </Button>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

