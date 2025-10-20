'use client';
import ProjectList from '@/components/projects/ProjectList';
import ProjectAccessGate from '@/components/projects/ProjectAccessGate';

export default function ProjectsPage() {
    return (
        <ProjectAccessGate>
            <div className="space-y-8">
                <ProjectList />
            </div>
        </ProjectAccessGate>
    )
}
