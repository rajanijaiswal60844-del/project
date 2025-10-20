'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { projects as initialProjects, labels as initialLabels, type Project } from '@/lib/data';

interface ProjectsContextType {
  projects: Project[];
  labels: string[];
  addProject: (project: Project) => void;
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [labels, setLabels] = useState<string[]>(initialLabels);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const storedProjects = localStorage.getItem('projects');
      if (storedProjects) {
        setProjects(JSON.parse(storedProjects));
      } else {
        setProjects(initialProjects);
        localStorage.setItem('projects', JSON.stringify(initialProjects));
      }
    } catch (error) {
      console.error("Failed to access localStorage or parse projects:", error);
      setProjects(initialProjects);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
        try {
            localStorage.setItem('projects', JSON.stringify(projects));
            // Update labels based on current projects
            const allLabels = projects.flatMap(p => p.labels);
            const uniqueLabels = [...new Set(allLabels)];
            setLabels([...new Set([...initialLabels, ...uniqueLabels])]);
        } catch (error) {
            console.error("Failed to save projects to localStorage:", error);
        }
    }
  }, [projects, isInitialized]);

  const addProject = (project: Project) => {
    setProjects(prevProjects => [project, ...prevProjects]);
  };

  const value = { projects, labels, addProject };

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectsContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectsProvider');
  }
  return context;
}
