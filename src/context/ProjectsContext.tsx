
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { initialProjects, labels as initialLabels, type Project } from '@/lib/data';

interface ProjectsContextType {
  projects: Project[];
  labels: string[];
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  deleteProject: (projectId: string) => void;
  addLabel: (label: string) => void;
  deleteLabel: (label: string) => void;
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const storedProjects = localStorage.getItem('projects');
      const storedLabels = localStorage.getItem('projectLabels');

      if (storedProjects) {
        setProjects(JSON.parse(storedProjects));
      } else {
        setProjects(initialProjects);
        localStorage.setItem('projects', JSON.stringify(initialProjects));
      }

      if (storedLabels) {
          setLabels(JSON.parse(storedLabels));
      } else {
        const allInitialLabels = initialProjects.flatMap(p => p.labels);
        const uniqueInitialLabels = [...new Set([...initialLabels, ...allInitialLabels])];
        setLabels(uniqueInitialLabels);
        localStorage.setItem('projectLabels', JSON.stringify(uniqueInitialLabels));
      }

    } catch (error) {
      console.error("Failed to access localStorage or parse data:", error);
      setProjects(initialProjects);
      setLabels(initialLabels);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
        try {
            localStorage.setItem('projects', JSON.stringify(projects));
            // Recalculate labels from projects, but don't remove custom ones unless they are explicitly deleted
            const projectLabels = projects.flatMap(p => p.labels);
            const combinedLabels = [...new Set([...labels, ...projectLabels])];
            setLabels(combinedLabels);
        } catch (error) {
            console.error("Failed to save projects to localStorage:", error);
        }
    }
  }, [projects, isInitialized]);

    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('projectLabels', JSON.stringify(labels));
        }
    }, [labels, isInitialized]);

  const addProject = (project: Project) => {
    setProjects(prevProjects => [project, ...prevProjects]);
  };

  const updateProject = (updatedProject: Project) => {
    setProjects(prevProjects => prevProjects.map(p => p.id === updatedProject.id ? updatedProject : p));
  }

  const deleteProject = (projectId: string) => {
    setProjects(prevProjects => prevProjects.filter(p => p.id !== projectId));
  }

  const addLabel = (label: string) => {
    if (label && !labels.includes(label)) {
        setLabels(prevLabels => [...prevLabels, label]);
    }
  }

  const deleteLabel = (labelToDelete: string) => {
    setLabels(prevLabels => prevLabels.filter(l => l !== labelToDelete));
    // Also remove the label from all projects that use it
    setProjects(prevProjects => prevProjects.map(p => ({
        ...p,
        labels: p.labels.filter(l => l !== labelToDelete)
    })))
  }

  const value = { projects, labels, addProject, updateProject, deleteProject, addLabel, deleteLabel };

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
