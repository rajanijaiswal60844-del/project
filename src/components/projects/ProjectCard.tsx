
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Project } from '@/lib/data';
import ImagePreviewDialog from '../common/ImagePreviewDialog';
import { Button } from '../ui/button';
import { Send } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const router = useRouter();

  const handleForwardToChat = () => {
    const chatMessage = `Project: ${project.name}\nDescription: ${project.description}`;
    sessionStorage.setItem('forwardedMessage', chatMessage);
    router.push('/chat');
  }

  return (
    <>
      <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl group">
        <CardHeader className="p-0 relative">
          <div 
            className="relative w-full aspect-[3/2] bg-muted/20 cursor-pointer"
            onClick={() => setIsPreviewOpen(true)}
          >
              <Image
                  src={project.imageUrl}
                  alt={project.name}
                  fill
                  className="object-contain"
                  data-ai-hint={project.imageHint}
              />
          </div>
        </CardHeader>
        <CardContent className="pt-6 flex-1">
          <CardTitle className="font-headline text-xl mb-2">{project.name}</CardTitle>
          <CardDescription>{project.description}</CardDescription>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <div className="flex flex-wrap gap-2">
            {project.labels.map((label) => (
              <Badge key={label} variant="secondary" className="font-normal">{label}</Badge>
            ))}
          </div>
           <Button variant="ghost" size="icon" onClick={handleForwardToChat}>
              <Send className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
           </Button>
        </CardFooter>
      </Card>
      <ImagePreviewDialog 
        isOpen={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        imageUrl={project.imageUrl}
        altText={project.name}
      />
    </>
  );
}
