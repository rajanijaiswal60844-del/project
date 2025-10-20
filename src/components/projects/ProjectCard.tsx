import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Project } from '@/lib/data';
import { Button } from '../ui/button';
import { Trash2, Pencil } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onDelete: (id: string) => void;
  onEdit: (project: Project) => void;
}

export default function ProjectCard({ project, onDelete, onEdit }: ProjectCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl group">
      <CardHeader className="p-0 relative">
        <div className="absolute top-2 right-2 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => onEdit(project)}>
                <Pencil className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => onDelete(project.id)}>
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
        <div className="relative w-full aspect-[3/2]">
            <Image
                src={project.imageUrl}
                alt={project.name}
                fill
                className="object-cover"
                data-ai-hint={project.imageHint}
            />
        </div>
      </CardHeader>
      <CardContent className="pt-6 flex-1">
        <CardTitle className="font-headline text-xl mb-2">{project.name}</CardTitle>
        <CardDescription>{project.description}</CardDescription>
      </CardContent>
      <CardFooter>
        <div className="flex flex-wrap gap-2">
          {project.labels.map((label) => (
            <Badge key={label} variant="secondary" className="font-normal">{label}</Badge>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}
