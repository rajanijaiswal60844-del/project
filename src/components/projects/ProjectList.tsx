
'use client';

import { useState, useEffect } from 'react';
import ProjectCard from './ProjectCard';
import { Button } from '../ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { useProjects } from '@/context/ProjectsContext';
import { Input } from '../ui/input';
import { Loader2, Search } from 'lucide-react';
import type { Project } from '@/lib/data';
import ProjectCommentsDialog from './ProjectCommentsDialog';

export default function ProjectList() {
  const { projects, labels, isProjectsLoading, isLabelsLoading } = useProjects();
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  useEffect(() => {
    const projectIdToHighlight = sessionStorage.getItem('highlightProject');
    if (projectIdToHighlight && !isProjectsLoading) {
        const element = document.getElementById(`project-card-${projectIdToHighlight}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
            setTimeout(() => {
                element.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
            }, 3000);
        }
        sessionStorage.removeItem('highlightProject');
    }
  }, [projects, isProjectsLoading]);


  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredProjects = projects.filter(project => {
    const labelMatch = activeFilter === 'All' || project.labels.includes(activeFilter);
    const searchTermMatch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) || project.description.toLowerCase().includes(searchTerm.toLowerCase());
    return labelMatch && searchTermMatch;
  });

  const isLoading = isProjectsLoading || isLabelsLoading;

  return (
    <>
    <div className="space-y-6">
       <div>
            <h1 className="text-3xl md:text-4xl font-headline font-bold text-foreground">Projects</h1>
            <p className="text-muted-foreground mt-2">
                Search and filter through your projects.
            </p>
        </div>

      <div className="space-y-4">
         <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    placeholder="Search projects..."
                    className="pl-10 h-10"
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
            </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={activeFilter === 'All' ? 'default' : 'outline'}
            onClick={() => setActiveFilter('All')}
            className="rounded-full"
          >
            All
          </Button>
          {labels.map(label => (
            <Button
              key={label.id}
              size="sm"
              variant={activeFilter === label.name ? 'default' : 'outline'}
              onClick={() => setActiveFilter(label.name)}
              className="rounded-full"
            >
              {label.name}
            </Button>
          ))}
        </div>
      </div>
      
      {isLoading && (
        <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      )}

      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         <AnimatePresence>
            {!isLoading && filteredProjects.map(project => (
                 <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                 >
                    <ProjectCard project={project} onCommentClick={() => setSelectedProject(project)} />
                </motion.div>
            ))}
        </AnimatePresence>
      </motion.div>
      {!isLoading && filteredProjects.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
            <p>No projects found. Add one from the Admin Panel.</p>
        </div>
      )}
    </div>

    <ProjectCommentsDialog
        project={selectedProject}
        isOpen={!!selectedProject}
        setIsOpen={() => setSelectedProject(null)}
    />
    </>
  );
}
