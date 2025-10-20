
'use client';

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useProjects } from "@/context/ProjectsContext";
import type { Project, Comment } from "@/lib/data";
import { Send, MessageSquare, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { formatDistanceToNow } from 'date-fns';
import { useCollection, useFirestore, useUser, useMemoFirebase, errorEmitter, FirestorePermissionError } from "@/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy, Timestamp } from "firebase/firestore";

interface ProjectCommentsDialogProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    project: Project | null;
}

const formatTimestamp = (ts: Timestamp | null | undefined) => {
    if (!ts) return '';
    return formatDistanceToNow(ts.toDate(), { addSuffix: true });
}

export default function ProjectCommentsDialog({ isOpen, setIsOpen, project }: ProjectCommentsDialogProps) {
    const { getProjectCommentsRef } = useProjects();
    const [newComment, setNewComment] = useState('');
    const [username, setUsername] = useState('User');

    const { user } = useUser();
    const firestore = useFirestore();

    const commentsQuery = useMemoFirebase(() => 
        project ? query(getProjectCommentsRef(project.id), orderBy('timestamp', 'asc')) : null,
        [project, getProjectCommentsRef]
    );

    const { data: comments, isLoading: areCommentsLoading } = useCollection<Comment>(commentsQuery);

    useEffect(() => {
      const savedUsername = localStorage.getItem('chatUsername');
      if(savedUsername) setUsername(savedUsername);
    }, []);

    useEffect(() => {
        if (!isOpen) {
            setNewComment('');
        }
    }, [isOpen]);

    const handleAddComment = async () => {
      if (newComment.trim() === '' || !project || !user) return;

      const commentsCol = collection(firestore, 'projects', project.id, 'comments');
      const commentData = {
            text: newComment,
            author: username,
            timestamp: serverTimestamp(),
        };
      
      try {
        await addDoc(commentsCol, commentData)
        .catch((serverError) => {
            const permissionError = new FirestorePermissionError({
              path: commentsCol.path,
              operation: 'create',
              requestResourceData: commentData,
            });
            errorEmitter.emit('permission-error', permissionError);
        });
        setNewComment('');
      } catch (error) {
        console.error("Error adding comment:", error);
      }
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
                    {areCommentsLoading && (
                         <div className="flex items-center justify-center h-full text-muted-foreground py-8">
                            <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                    )}
                    {!areCommentsLoading && comments && comments.length > 0 ? (
                        comments.map(comment => (
                            <div key={comment.id} className="flex gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>{comment.author.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex items-baseline gap-2">
                                        <p className="font-semibold text-sm">{comment.author}</p>
                                        <p className="text-xs text-muted-foreground">{formatTimestamp(comment.timestamp)}</p>
                                    </div>
                                    <p className="text-sm bg-muted/50 rounded-lg p-2">{comment.text}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                       !areCommentsLoading && <p className="text-sm text-muted-foreground text-center py-8">No comments yet. Be the first to comment!</p>
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
