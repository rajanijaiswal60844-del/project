'use client';

import { useState, useRef, FormEvent, useEffect, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BotIcon } from './BotIcon';
import { Loader2, Send, Paperclip, X } from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface Message {
  role: 'user' | 'bot';
  text: string;
  image?: string;
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (messages.length) {
      setTimeout(() => {
        if(scrollAreaRef.current) {
          scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
        }
      }, 100);
    }
  }, [messages, isLoading]);

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
    if ((!input.trim() && !image) || isLoading) return;

    const userMessage: Message = { role: 'user', text: input, image: image ?? undefined };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setImage(null);
  };

  return (
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
            <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
              {message.role === 'bot' && (
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-accent text-accent-foreground">
                    <BotIcon className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div className={`rounded-lg px-4 py-2 max-w-[80%] ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                {message.image && (
                  <div className="relative w-48 h-48 mb-2 rounded-md overflow-hidden">
                    <Image src={message.image} alt="User upload" layout="fill" objectFit="cover" />
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              </div>
              {message.role === 'user' && (
                <Avatar className="w-8 h-8">
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
              <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-accent text-accent-foreground">
                    <BotIcon className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="rounded-lg px-4 py-3 bg-muted flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground"/>
                </div>
            </div>
          )}
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
                disabled={isLoading}
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
                 <Button type="button" size="icon" variant="ghost" onClick={() => fileInputRef.current?.click()} disabled={isLoading}>
                    <Paperclip className="h-5 w-5" />
                 </Button>
                <Button type="submit" size="icon" disabled={isLoading || (!input.trim() && !image)}>
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </form>
        </div>
      </div>
    </div>
  );
}