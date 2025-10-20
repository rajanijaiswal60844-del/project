
'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { initialProjects, labels as initialLabelsData, type Project, type Label } from '@/lib/data';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, doc, setDoc, addDoc, deleteDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';

interface ProjectsContextType {
  projects: Project[];
  labels: Label[];
  isProjectsLoading: boolean;
  isLabelsLoading: boolean;
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  updateProject: (project: Project) => void;
  deleteProject: (projectId: string) => void;
  addLabel: (label: Omit<Label, 'id'>) => void;
  deleteLabel: (labelId: string) => void;
  getProjectCommentsRef: (projectId: string) => any;
  updateProjectComments: (projectId: string, comments: any) => void;
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const firestore = useFirestore();

  const projectsQuery = useMemoFirebase(() => 
    user ? query(collection(firestore, 'users', user.uid, 'projects'), orderBy('createdAt', 'desc')) : null,
    [user, firestore]
  );
  const { data: projects, isLoading: isProjectsLoading } = useCollection<Project>(projectsQuery);

  const labelsQuery = useMemoFirebase(() =>
    user ? collection(firestore, 'users', user.uid, 'labels') : null,
    [user, firestore]
  );
  const { data: labels, isLoading: isLabelsLoading } = useCollection<Label>(labelsQuery);


  const addProject = async (projectData: Omit<Project, 'id' | 'createdAt'>) => {
    if (!user) return;
    const projectsCol = collection(firestore, 'users', user.uid, 'projects');
    await addDoc(projectsCol, {
      ...projectData,
      createdAt: serverTimestamp(),
    });
  };

  const updateProject = async (updatedProject: Project) => {
    if (!user) return;
    const projectRef = doc(firestore, 'users', user.uid, 'projects', updatedProject.id);
    await setDoc(projectRef, updatedProject, { merge: true });
  }

  const deleteProject = async (projectId: string) => {
    if (!user) return;
    const projectRef = doc(firestore, 'users', user.uid, 'projects', projectId);
    await deleteDoc(projectRef);
  }

  const addLabel = async (labelData: Omit<Label, 'id'>) => {
    if (!user) return;
    const labelsCol = collection(firestore, 'users', user.uid, 'labels');
    await addDoc(labelsCol, labelData);
  }

  const deleteLabel = async (labelId: string) => {
    if (!user) return;
    const labelRef = doc(firestore, 'users', user.uid, 'labels', labelId);
    await deleteDoc(labelRef);

    // This part is tricky without transactions on the client-side. 
    // A cloud function would be better, but for now, we remove the label from projects one by one.
    projects?.forEach(p => {
        if (p.labels.includes(labels?.find(l => l.id === labelId)?.name || '')) {
            const updatedLabels = p.labels.filter(lName => lName !== labels?.find(l => l.id === labelId)?.name);
            updateProject({ ...p, labels: updatedLabels });
        }
    });
  }

  const getProjectCommentsRef = (projectId: string) => {
    if (!user) return null;
    return collection(firestore, 'users', user.uid, 'projects', projectId, 'comments');
  }

  const updateProjectComments = async (projectId: string, comments: any) => {
      // This function is a bit of a placeholder. In a real app, you'd add one comment at a time.
      if (!user) return;
      console.log("Updating comments is not fully implemented in context. Handle single comment adds.", projectId, comments);
  }


  const value = { 
      projects: projects || [], 
      labels: labels || [],
      isProjectsLoading,
      isLabelsLoading,
      addProject, 
      updateProject, 
      deleteProject, 
      addLabel, 
      deleteLabel,
      getProjectCommentsRef,
      updateProjectComments
    };

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
