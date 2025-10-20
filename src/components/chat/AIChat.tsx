
'use client';

import { useState, useRef, FormEvent, useEffect, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Paperclip, X, User, Volume2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { aiChatWithGemini } from '@/ai/flows/ai-chat-with-gemini';
import { textToSpeech } from '@/ai/flows/text-to-speech-flow';
import { BotIcon } from './BotIcon';


interface AIChatMessage {
  id: string;
  role: 'user' | 'bot';
  text: string;
  image?: string;
}

export default function AIChat() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [loadingAudioId, setLoadingAudioId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          variant: 'destructive',
          title: 'Image too large',
          description: 'Please upload images smaller than 2MB.'
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        setImage(loadEvent.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePlayAudio = async (message: AIChatMessage) => {
    if (playingAudioId === message.id && audioRef.current) {
      audioRef.current.pause();
      setPlayingAudioId(null);
      return;
    }

    setLoadingAudioId(message.id);
    setPlayingAudioId(null);

    try {
        const result = await textToSpeech(message.text);
        const audio = new Audio(result.media);
        audioRef.current = audio;
        audio.play();
        setPlayingAudioId(message.id);
        audio.onended = () => {
            setPlayingAudioId(null);
        };
    } catch(e) {
        toast({ variant: 'destructive', title: 'TTS Error', description: 'Could not generate audio.' });
        console.error(e);
    } finally {
        setLoadingAudioId(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !image) || isLoading) return;

    const userMessage: AIChatMessage = { id: Date.now().toString(), role: 'user', text: input, image: image || undefined };
    setMessages(prev => [...prev, userMessage]);
    
    const currentInput = input;
    const currentImage = image;

    setInput('');
    setImage(null);
    setIsLoading(true);

    try {
      const result = await aiChatWithGemini({ query: currentInput, image: currentImage || undefined });
      const botMessage: AIChatMessage = { id: (Date.now() + 1).toString(), role: 'bot', text: result.response };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("AI Chat Error:", error);
      toast({
        variant: "destructive",
        title: "AI Error",
        description: "The AI is not responding. Please try again later."
      });
       // Re-add user message to state if AI fails
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full border rounded-lg">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-6 max-w-4xl mx-auto">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-muted-foreground pt-16">
              <p>Ask the AI anything. You can also upload an image.</p>
            </div>
          )}
          {messages.map((message) => (
            <div key={message.id} className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <Avatar className="w-8 h-8">
                {message.role === 'user' ? <User /> : <BotIcon />}
              </Avatar>
              <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                 <p className="font-bold text-sm">{message.role === 'user' ? 'You' : 'AI Assistant'}</p>
                <div className={`rounded-lg px-4 py-2 inline-block max-w-[90%] ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    {message.image && (
                    <div className="relative w-48 h-48 mb-2 rounded-md overflow-hidden">
                        <Image src={message.image} alt="User upload" layout="fill" objectFit="cover" />
                    </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                </div>
                {message.role === 'bot' && (
                    <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 mt-1"
                        onClick={() => handlePlayAudio(message)}
                        disabled={loadingAudioId === message.id}
                    >
                         {loadingAudioId === message.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Volume2 className="w-4 h-4" />
                        )}
                    </Button>
                )}
              </div>
            </div>
          ))}
           {isLoading && (
             <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8"><BotIcon /></Avatar>
                <div className="flex-1">
                    <p className="font-bold text-sm">AI Assistant</p>
                    <div className="rounded-lg px-4 py-2 bg-muted inline-flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Thinking...</span>
                    </div>
                </div>
             </div>
           )}
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
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </Button>
              </div>
            </form>
        </div>
      </div>
    </div>
  );
}
