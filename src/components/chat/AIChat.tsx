
'use client';

import { useState, useRef, FormEvent, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Paperclip, X, ArrowRight } from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Label } from '../ui/label';
import { Card, CardContent } from '../ui/card';
import { useFirestore, useCollection, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, Timestamp } from 'firebase/firestore';


interface ForwardedProjectInfo {
    id: string;
    name: string;
    description: string;
}

interface Message {
  id: string;
  username: string;
  text?: string;
  image?: string;
  forwardedProject?: ForwardedProjectInfo;
  timestamp?: Timestamp;
}

export default function AIChat() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(false);

  const firestore = useFirestore();

  const messagesQuery = useMemoFirebase(() => 
    firestore ? query(collection(firestore, 'chatMessages'), orderBy('timestamp', 'asc')) : null,
    [firestore]
  );
  const { data: messages, isLoading: isMessagesLoading } = useCollection<Message>(messagesQuery);


  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const savedUsername = localStorage.getItem('chatUsername');
    if (savedUsername) {
      setUsername(savedUsername);
    } else {
      setIsUsernameModalOpen(true);
    }
    
    // Handle forwarded project from sessionStorage
    const handleForwardedProject = () => {
        const forwardedProjectRaw = sessionStorage.getItem('forwardedProject');
        if (forwardedProjectRaw && firestore) {
            try {
                const project: ForwardedProjectInfo = JSON.parse(forwardedProjectRaw);
                const messagesCol = collection(firestore, 'chatMessages');
                const messageData = {
                    username: savedUsername || 'User',
                    text: `Let's discuss the project: ${project.name}`,
                    forwardedProject: project,
                    timestamp: serverTimestamp(),
                };
                addDoc(messagesCol, messageData)
                .catch((serverError) => {
                    const permissionError = new FirestorePermissionError({
                      path: messagesCol.path,
                      operation: 'create',
                      requestResourceData: messageData,
                    });
                    errorEmitter.emit('permission-error', permissionError);
                });
            } catch (e) {
                console.error("Failed to parse or save forwarded project", e);
            } finally {
                sessionStorage.removeItem('forwardedProject');
            }
        }
    };
    handleForwardedProject();
  }, [firestore]);

  useEffect(() => {
    if (messages && messages.length > 0) {
      setTimeout(() => {
        if(scrollAreaRef.current) {
          scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
        }
      }, 100);
    }
  }, [messages]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        setImage(loadEvent.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !image) || isLoading || !username || !firestore) return;

    const messagesCol = collection(firestore, 'chatMessages');

    const messageData: any = {
        username,
        text: input,
        timestamp: serverTimestamp(),
    }

    if (image) {
        messageData.image = image;
    }
    
    setInput('');
    setImage(null);
    setIsLoading(true);

    addDoc(messagesCol, messageData)
        .catch((serverError) => {
            const permissionError = new FirestorePermissionError({
              path: messagesCol.path,
              operation: 'create',
              requestResourceData: messageData,
            });
            errorEmitter.emit('permission-error', permissionError);
             toast({
                variant: "destructive",
                title: "Send Error",
                description: "Could not send message."
            });
        }).finally(() => {
            setIsLoading(false);
        });
  };

  const handleSetUsername = () => {
    if (usernameInput.trim()) {
        const newUsername = usernameInput.trim();
        setUsername(newUsername);
        localStorage.setItem('chatUsername', newUsername);
        setIsUsernameModalOpen(false);
        toast({ title: `Welcome, ${newUsername}!`});
    } else {
        toast({ variant: 'destructive', title: 'Username required', description: 'Please enter a username to join the chat.' });
    }
  }

  const handleViewProject = (projectId: string) => {
    sessionStorage.setItem('highlightProject', projectId);
    router.push('/projects');
  }

  return (
    <>
    <div className="flex flex-col h-full border rounded-lg">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-6 max-w-4xl mx-auto">
          {isMessagesLoading && (
            <div className="flex items-center justify-center h-full text-muted-foreground pt-16">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          )}
          {!isMessagesLoading && messages && messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-muted-foreground pt-16">
              <p>Start a conversation.</p>
            </div>
          )}
          {messages && messages.map((message) => (
            <div key={message.id} className="flex items-start gap-3">
              <Avatar className="w-8 h-8">
                  <AvatarFallback>{message.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              <div className="flex-1">
                 <p className="font-bold text-sm">{message.username}</p>
                <div className="rounded-lg px-4 py-2 bg-muted inline-block max-w-[90%]">
                    {message.image && (
                    <div className="relative w-48 h-48 mb-2 rounded-md overflow-hidden">
                        <Image src={message.image} alt="User upload" layout="fill" objectFit="cover" />
                    </div>
                    )}
                    {message.forwardedProject ? (
                        <Card className="bg-primary/10 border-primary/50 my-2">
                            <CardContent className="p-3 space-y-2">
                                <p className="font-semibold text-primary">{message.forwardedProject.name}</p>
                                <p className="text-sm text-foreground/80 line-clamp-2">{message.forwardedProject.description}</p>
                                {message.text && <p className="text-sm pt-2 border-t border-primary/20">{message.text}</p>}
                                <Button size="sm" className="w-full mt-2" onClick={() => handleViewProject(message.forwardedProject!.id)}>
                                    View Project <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                         <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="p-4 border-t bg-background rounded-b-lg">
        <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="relative">
                {image && (
                    <div className="absolute bottom-14 left-0 p-2 bg-card border rounded-md shadow-sm">
                        <div className="relative w-20 h-20">
                            <Image src={image} alt="Preview" layout="fill" objectFit="cover" className="rounded-sm" />
                            <Button
                                size="icon"
                                variant="destructive"
                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                onClick={() => setImage(null)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message, or upload an image..."
                disabled={isLoading || !username}
                className="pr-24 h-12"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                 <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                 />
                 <Button type="button" size="icon" variant="ghost" onClick={() => fileInputRef.current?.click()} disabled={isLoading || !username}>
                    <Paperclip className="h-5 w-5" />
                 </Button>
                <Button type="submit" size="icon" disabled={isLoading || (!input.trim() && !image) || !username}>
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </Button>
              </div>
            </form>
        </div>
      </div>
    </div>

    <AlertDialog open={isUsernameModalOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Enter the Chat</AlertDialogTitle>
                <AlertDialogDescription>Please set a username to start chatting.</AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input 
                    id="username"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSetUsername()}
                    placeholder="e.g. JaneDoe"
                />
            </div>
            <AlertDialogFooter>
                <AlertDialogAction onClick={handleSetUsername}>Set Username</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>

    </>
  );
}
