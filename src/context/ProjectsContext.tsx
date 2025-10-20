
'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { type Project, type Label } from '@/lib/data';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, doc, setDoc, addDoc, deleteDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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
    firestore ? query(collection(firestore, 'projects'), orderBy('createdAt', 'desc')) : null,
    [firestore]
  );
  const { data: projects, isLoading: isProjectsLoading } = useCollection<Project>(projectsQuery);

  const labelsQuery = useMemoFirebase(() =>
    firestore ? collection(firestore, 'labels') : null,
    [firestore]
  );
  const { data: labels, isLoading: isLabelsLoading } = useCollection<Label>(labelsQuery);


  const addProject = (projectData: Omit<Project, 'id' | 'createdAt'>) => {
    if (!user) return;
    const projectsCol = collection(firestore, 'projects');
    const data = {
      ...projectData,
      createdAt: serverTimestamp(),
    };
    addDoc(projectsCol, data)
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: projectsCol.path,
          operation: 'create',
          requestResourceData: data,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const updateProject = (updatedProject: Project) => {
    if (!user) return;
    const projectRef = doc(firestore, 'projects', updatedProject.id);
    setDoc(projectRef, updatedProject, { merge: true })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: projectRef.path,
          operation: 'update',
          requestResourceData: updatedProject,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  }

  const deleteProject = (projectId: string) => {
    if (!user) return;
    const projectRef = doc(firestore, 'projects', projectId);
    deleteDoc(projectRef)
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: projectRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  }

  const addLabel = (labelData: Omit<Label, 'id'>) => {
    if (!user) return;
    const labelsCol = collection(firestore, 'labels');
    addDoc(labelsCol, labelData)
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: labelsCol.path,
          operation: 'create',
          requestResourceData: labelData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  }

  const deleteLabel = (labelId: string) => {
    if (!user) return;
    const labelRef = doc(firestore, 'labels', labelId);
    deleteDoc(labelRef)
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: labelRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      });

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
    return collection(firestore, 'projects', projectId, 'comments');
  }

  const updateProjectComments = (projectId: string, comments: any) => {
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
