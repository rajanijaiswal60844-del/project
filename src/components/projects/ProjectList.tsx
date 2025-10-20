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

  const filteredProjects = projects.filter(project => {
    const labelMatch = activeFilter === 'All' || project.labels.includes(activeFilter);
    const searchTermMatch = project.name.toLowerCase().includes(searchTerm.toLowerCase());
    return labelMatch && searchTermMatch;
  });

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
                placeholder="Search projects by name..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeFilter === 'All' ? 'default' : 'outline'}
            onClick={() => setActiveFilter('All')}
          >
            All
          </Button>
          {labels.map(label => (
            <Button
              key={label}
              variant={activeFilter === label ? 'default' : 'outline'}
              onClick={() => setActiveFilter(label)}
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
  );
}
