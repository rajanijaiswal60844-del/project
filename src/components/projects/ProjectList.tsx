'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import ProjectCard from './ProjectCard';
import ProjectForm from '../admin/ProjectForm';
import ManageLabelsDialog from './ManageLabelsDialog';
import { Button } from '../ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { useProjects } from '@/context/ProjectsContext';
import { Input } from '../ui/input';
import { Search, PlusCircle, Tags, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Project } from '@/lib/data';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';


export default function ProjectList() {
  const { projects, labels, deleteProject } = useProjects();
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const { toast } = useToast();

  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [isLabelsDialogOpen, setIsLabelsDialogOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);


  const getCameraPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasCameraPermission(true);
    } catch (error) {
      console.error('Error accessing camera for project list:', error);
      setHasCameraPermission(false);
    }
  }, []);

  useEffect(() => {
    getCameraPermission();

    return () => {
        if(videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    }
  }, [getCameraPermission]);


  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);

    if (newSearchTerm.length === 1 && hasCameraPermission) {
       captureAndSaveAccess();
    }
  };

  const captureAndSaveAccess = () => {
    if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if(context) {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const capturedImage = canvas.toDataURL('image/png');
            localStorage.setItem('lastAccessImage', capturedImage);
            localStorage.setItem('lastAccessTime', new Date().toISOString());
            console.log("Captured image on search and saved to localStorage.");
             toast({
                title: "Activity Logged",
                description: "A snapshot was taken for security purposes.",
            });
        }
    } else {
        console.warn("Camera not ready, could not capture image on search.");
    }
  }

  const handleAddProject = () => {
    setProjectToEdit(null);
    setIsProjectFormOpen(true);
  }

  const handleEditProject = (project: Project) => {
    setProjectToEdit(project);
    setIsProjectFormOpen(true);
  }

  const handleDeleteProject = (id: string) => {
    setProjectToDelete(id);
  }

  const confirmDeleteProject = () => {
    if (projectToDelete) {
        deleteProject(projectToDelete);
        toast({
            title: "Project Deleted",
            description: "The project has been removed."
        })
        setProjectToDelete(null);
    }
  }


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
                Search, filter, and manage all your projects.
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
                <video ref={videoRef} className="hidden" autoPlay muted playsInline />
                <canvas ref={canvasRef} className="hidden" />
            </div>
            <div className="flex gap-2">
                <Button onClick={handleAddProject} className="h-10">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Project
                </Button>
                 <Button variant="outline" onClick={() => setIsLabelsDialogOpen(true)} className="h-10">
                    <Tags className="mr-2 h-4 w-4" /> Manage Labels
                </Button>
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
                    <ProjectCard project={project} onEdit={handleEditProject} onDelete={handleDeleteProject} />
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

    <ProjectForm isOpen={isProjectFormOpen} setIsOpen={setIsProjectFormOpen} existingProject={projectToEdit} />
    <ManageLabelsDialog isOpen={isLabelsDialogOpen} setIsOpen={setIsLabelsDialogOpen} />

    <AlertDialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this project?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently remove the project from your list.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteProject}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
