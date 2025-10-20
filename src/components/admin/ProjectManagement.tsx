
'use client';

import { useState } from 'react';
import { useProjects } from '@/context/ProjectsContext';
import { useToast } from '@/hooks/use-toast';
import type { Project } from '@/lib/data';
import { AnimatePresence, motion } from 'framer-motion';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { PlusCircle, Tags, Trash2, Pencil } from 'lucide-react';
import ProjectForm from './ProjectForm';
import ManageLabelsDialog from '../projects/ManageLabelsDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import Image from 'next/image';
import { Badge } from '../ui/badge';
import ImagePreviewDialog from '../common/ImagePreviewDialog';


export default function ProjectManagement() {
    const { projects, deleteProject } = useProjects();
    const { toast } = useToast();

    const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
    const [isLabelsDialogOpen, setIsLabelsDialogOpen] = useState(false);
    const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
    const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
    const [imageToPreview, setImageToPreview] = useState<string | null>(null);

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

    return (
        <>
            <Card>
                <CardHeader className="flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="font-headline text-2xl">Project Management</CardTitle>
                        <CardDescription>Add, edit, or delete projects and manage labels.</CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                        <Button onClick={handleAddProject} className="flex-1 md:flex-initial">
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Project
                        </Button>
                        <Button variant="outline" onClick={() => setIsLabelsDialogOpen(true)} className="flex-1 md:flex-initial">
                            <Tags className="mr-2 h-4 w-4" /> Manage Labels
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="border rounded-lg overflow-x-auto">
                        <div className="min-w-[700px]">
                            <div className="grid grid-cols-[50px_1fr_2fr_1fr_100px] items-center p-2 font-semibold text-sm text-muted-foreground border-b">
                                <div />
                                <p>Name</p>
                                <p>Description</p>
                                <p>Labels</p>
                                <div />
                            </div>
                            <AnimatePresence>
                                {projects.map(project => (
                                    <motion.div
                                        key={project.id}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.2 }}
                                        className="grid grid-cols-[50px_1fr_2fr_1fr_100px] items-center p-2 border-b last:border-b-0"
                                    >
                                        <div className="relative w-10 h-10 rounded-sm overflow-hidden cursor-pointer" onClick={() => setImageToPreview(project.imageUrl)}>
                                            <Image src={project.imageUrl} alt={project.name} fill className="object-cover" />
                                        </div>
                                        <p className="font-medium truncate pr-4">{project.name}</p>
                                        <p className="text-sm text-muted-foreground truncate pr-4">{project.description}</p>
                                        <div className="flex flex-wrap gap-1 pr-4">
                                            {project.labels.map(label => <Badge key={label} variant="secondary" className="font-normal text-xs">{label}</Badge>)}
                                        </div>
                                        <div className="flex gap-2 justify-end">
                                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEditProject(project)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button size="icon" variant="destructive-ghost" className="h-8 w-8" onClick={() => handleDeleteProject(project.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                             {projects.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p>No projects found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <ProjectForm isOpen={isProjectFormOpen} setIsOpen={setIsProjectFormOpen} existingProject={projectToEdit} />
            <ManageLabelsDialog isOpen={isLabelsDialogOpen} setIsOpen={setIsLabelsDialogOpen} />

            <AlertDialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the project.
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

            <ImagePreviewDialog
                isOpen={!!imageToPreview}
                onOpenChange={(open) => !open && setImageToPreview(null)}
                imageUrl={imageToPreview}
                altText="Project Image Preview"
            />
        </>
    );
}

const buttonVariants = {
  variants: {
    variant: {
      'destructive-ghost': 'hover:bg-destructive/10 text-destructive',
    },
    size: {
      icon: 'h-10 w-10',
    },
  },
};
