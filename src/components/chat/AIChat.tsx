'use client';

import { useState, useRef, FormEvent, useEffect, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Paperclip, X } from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Label } from '../ui/label';

interface Message {
  id: string;
  username: string;
  text: string;
  image?: string;
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const savedUsername = localStorage.getItem('chatUsername');
    if (savedUsername) {
      setUsername(savedUsername);
    } else {
      setIsUsernameModalOpen(true);
    }

     const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);
  

  useEffect(() => {
    if (messages.length) {
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
    if ((!input.trim() && !image) || isLoading || !username) return;

    const userMessage: Message = { 
        id: `msg-${Date.now()}`,
        username,
        text: input, 
        image: image ?? undefined 
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setImage(null);
  };

  const handleSetUsername = () => {
    if (usernameInput.trim()) {
        setUsername(usernameInput.trim());
        localStorage.setItem('chatUsername', usernameInput.trim());
        setIsUsernameModalOpen(false);
        toast({ title: `Welcome, ${usernameInput.trim()}!`});
    } else {
        toast({ variant: 'destructive', title: 'Username required', description: 'Please enter a username to join the chat.' });
    }
  }

  return (
    <>
    <div className="flex flex-col h-full">
      <div className="text-center py-4 border-b">
        <h1 className="text-2xl font-headline">Chat</h1>
        <p className="text-muted-foreground">Send messages and share files.</p>
      </div>
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-6 max-w-4xl mx-auto">
          {messages.length === 0 && !isLoading && (
            <div className="flex items-center justify-center h-full text-muted-foreground pt-16">
              <p>Start a conversation.</p>
            </div>
          )}
          {messages.map((message, index) => (
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
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="p-4 border-t bg-background">
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
                  <Send className="h-5 w-5" />
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
