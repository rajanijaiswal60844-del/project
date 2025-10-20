
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Project } from '@/lib/data';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl group">
      <CardHeader className="p-0 relative">
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
