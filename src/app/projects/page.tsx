'use client';
import ProjectList from '@/components/projects/ProjectList';
import ProjectAccessGate from '@/components/projects/ProjectAccessGate';

export default function ProjectsPage() {
    return (
        <ProjectAccessGate>
            <div className="space-y-8">
                 <div>
                    <h1 className="text-3xl md:text-4xl font-headline font-bold text-foreground">Projects</h1>
                    <p className="text-muted-foreground mt-2">
                        Search, filter, and manage all your projects.
                    </p>
                </div>
                <ProjectList />
            </div>
        </ProjectAccessGate>
    )
}
