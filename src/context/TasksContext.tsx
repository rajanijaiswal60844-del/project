
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { initialTasks, type StudyTask } from '@/lib/data';

interface TasksContextType {
  tasks: StudyTask[];
  addTask: (task: StudyTask) => void;
  updateTask: (task: StudyTask) => void;
  deleteTask: (taskId: string) => void;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const storedTasks = localStorage.getItem('studyTasks');
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      } else {
        setTasks(initialTasks);
        localStorage.setItem('studyTasks', JSON.stringify(initialTasks));
      }
    } catch (error) {
      console.error("Failed to access localStorage or parse tasks:", error);
      setTasks(initialTasks);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
        try {
            localStorage.setItem('studyTasks', JSON.stringify(tasks));
        } catch (error) {
            console.error("Failed to save tasks to localStorage:", error);
        }
    }
  }, [tasks, isInitialized]);

  const addTask = (task: StudyTask) => {
    setTasks(prevTasks => [...prevTasks, task].sort((a, b) => a.startTime.localeCompare(b.startTime)));
  };

  const updateTask = (updatedTask: StudyTask) => {
    setTasks(prevTasks => prevTasks.map(task => task.id === updatedTask.id ? updatedTask : task).sort((a, b) => a.startTime.localeCompare(b.startTime)));
  };
  
  const deleteTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };


  const value = { tasks, addTask, updateTask, deleteTask };

  return (
    <TasksContext.Provider value={value}>
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TasksContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
}
