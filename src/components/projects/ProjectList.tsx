'use client';

import { useState } from 'react';
import ProjectCard from './ProjectCard';
import { projects, labels } from '@/lib/data';
import { Button } from '../ui/button';
import { AnimatePresence, motion } from 'framer-motion';

export default function ProjectList() {
  const [activeFilter, setActiveFilter] = useState<string>('All');

  const filteredProjects = activeFilter === 'All' 
    ? projects 
    : projects.filter(p => p.labels.includes(activeFilter));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-headline font-bold">Projects</h2>
        <div className="flex flex-wrap gap-2 mt-4">
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
    </div>
  );
}
