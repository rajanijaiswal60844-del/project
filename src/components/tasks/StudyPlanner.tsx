
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { PlusCircle, Edit, Trash2, Folder } from 'lucide-react';
import { useTasks } from '@/context/TasksContext';
import { useProjects } from '@/context/ProjectsContext';
import { type StudyTask } from '@/lib/data';
import AddTaskDialog from './AddTaskDialog';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));

export default function StudyPlanner() {
  const { tasks, deleteTask } = useTasks();
  const { projects } = useProjects();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<StudyTask | null>(null);
  const [taskToEdit, setTaskToEdit] = useState<StudyTask | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000 * 60); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const timeToPercentage = useCallback((time: string | Date) => {
    const date = time instanceof Date ? time : new Date(`1970-01-01T${time}:00`);
    const minutes = date.getHours() * 60 + date.getMinutes();
    return (minutes / (24 * 60)) * 100;
  }, []);

  const getProjectName = useCallback((projectId?: string) => {
    if (!projectId) return null;
    const project = projects.find(p => p.id === projectId);
    return project?.name;
  }, [projects]);

  const currentTimePosition = useMemo(() => timeToPercentage(currentTime), [currentTime, timeToPercentage]);

  const handleAddTask = () => {
    setTaskToEdit(null);
    setIsDialogOpen(true);
  }

  const handleEditTask = (task: StudyTask) => {
    setTaskToEdit(task);
    setIsDialogOpen(true);
  }

  const handleDeleteConfirm = (task: StudyTask) => {
    setTaskToDelete(task);
  }
  
  const performDelete = () => {
    if (taskToDelete) {
        deleteTask(taskToDelete.id);
        setTaskToDelete(null);
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-headline text-2xl">Today's Study Plan</CardTitle>
            <CardDescription>A visual timeline of your daily tasks.</CardDescription>
          </div>
          <Button onClick={handleAddTask}>
            <PlusCircle className="mr-2" />
            Add Task
          </Button>
        </CardHeader>
        <CardContent>
          <div className="relative h-[600px] overflow-y-auto">
            <div className="absolute top-0 left-12 right-0 bottom-0 grid grid-cols-24">
              {hours.map((_, index) => (
                <div key={index} className="h-full border-r border-dashed border-border"></div>
              ))}
            </div>
            
            <div className="relative z-10 space-y-2 pt-8">
              {tasks.map(task => {
                const startPercent = timeToPercentage(task.startTime);
                const endPercent = timeToPercentage(task.endTime);
                const width = endPercent - startPercent;

                const now = currentTime.getTime();
                const start = new Date(`1970-01-01T${task.startTime}`).getTime();
                const end = new Date(`1970-01-01T${task.endTime}`).getTime();
                
                const progress = now > start && now < end ? ((now - start) / (end - start)) * 100 : (now >= end ? 100 : 0);
                const projectName = getProjectName(task.projectId);

                return (
                    <div
                        key={task.id}
                        className="h-20 rounded-lg group"
                        style={{ marginLeft: `calc(${startPercent}% + 48px)`, width: `calc(${width}% - 1px)` }}
                    >
                        <div 
                            className={cn("h-full w-full rounded-lg text-white p-2 flex flex-col justify-between relative overflow-hidden shadow-md transition-opacity", now >= end ? "opacity-60" : "")} 
                            style={{ backgroundColor: task.color }}
                        >
                             <div 
                                className="absolute top-0 left-0 h-full bg-black/20" 
                                style={{ width: `${progress}%` }}
                            />
                           <div className="relative z-10 flex justify-between items-start">
                             <div className="flex-1 overflow-hidden pr-2">
                                <p className="font-bold text-sm truncate">{task.name}</p>
                                <p className="text-xs opacity-90">{task.startTime} - {task.endTime}</p>
                                {projectName && (
                                    <div className="flex items-center gap-1 mt-1">
                                        <Folder size={12} className="opacity-90" />
                                        <p className="text-xs opacity-90 truncate">{projectName}</p>
                                    </div>
                                )}
                             </div>
                             <div className="flex gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-white hover:bg-white/20" onClick={() => handleEditTask(task)}><Edit size={16} /></Button>
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-white hover:bg-white/20" onClick={() => handleDeleteConfirm(task)}><Trash2 size={16} /></Button>
                             </div>
                           </div>
                        </div>
                    </div>
                );
              })}
            </div>

            <div className="absolute top-0 left-0 bottom-0 w-12 flex flex-col justify-between text-xs text-muted-foreground">
              {hours.map(hour => (
                <div key={hour} className="relative h-full flex items-start">
                  <span className="-translate-y-1/2">{hour}:00</span>
                </div>
              ))}
              <div className="relative h-full flex items-start">
                  <span className="-translate-y-1/2">00:00</span>
                </div>
            </div>

            <div
              className="absolute top-8 bottom-0 w-0.5 bg-red-500 z-20"
              style={{ left: `calc(${currentTimePosition}% + 48px)` }}
            >
              <div className="absolute -top-2.5 -translate-x-1/2 w-5 h-5 rounded-full bg-red-500 border-2 border-white"></div>
            </div>
          </div>
        </CardContent>
      </Card>
      <AddTaskDialog isOpen={isDialogOpen} setIsOpen={setIsDialogOpen} existingTask={taskToEdit} />
      <AlertDialog open={!!taskToDelete} onOpenChange={(open) => !open && setTaskToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the task "{taskToDelete?.name}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setTaskToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={performDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </>
  );
}
