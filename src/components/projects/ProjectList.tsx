
'use client';

import { useState } from 'react';
import ProjectCard from './ProjectCard';
import { Button } from '../ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { useProjects } from '@/context/ProjectsContext';
import { Input } from '../ui/input';
import { Search } from 'lucide-react';

export default function ProjectList() {
  const { projects, labels } = useProjects();
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredProjects = projects.filter(project => {
    const labelMatch = activeFilter === 'All' || project.labels.includes(activeFilter);
    const searchTermMatch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) || project.description.toLowerCase().includes(searchTerm.toLowerCase());
    return labelMatch && searchTermMatch;
  });

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
              key={label}
              size="sm"
              variant={activeFilter === label ? 'default' : 'outline'}
              onClick={() => setActiveFilter(label)}
              className="rounded-full"
            >
              {label}
            </Button>
          ))}
        </div>
      </div>
      
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         <AnimatePresence>
            {filteredProjects.map(project => (
                 <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                 >
                    <ProjectCard project={project} />
                </motion.div>
            ))}
        </AnimatePresence>
      </motion.div>
      {filteredProjects.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
            <p>No projects found matching your criteria.</p>
        </div>
      )}
    </div>
    </>
  );
}
