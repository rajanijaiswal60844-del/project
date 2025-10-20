
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useProjects } from "@/context/ProjectsContext";
import { useTasks } from "@/context/TasksContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { ScrollArea } from "../ui/scroll-area";

export default function TaskTimeline() {
  const { projects } = useProjects();
  const { tasks } = useTasks();

  const projectsWithTasks = projects.filter(project => tasks.some(task => task.projectId === project.id));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Daily Task Timeline</CardTitle>
        <CardDescription>A visual overview of tasks scheduled for today across all projects.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-full max-h-[600px] w-full">
            <div className="space-y-6 pr-6 pb-4">
            {projectsWithTasks.length > 0 ? (
                projectsWithTasks.map(project => {
                const projectTasks = tasks.filter(task => task.projectId === project.id);
                // We already filtered, but as a safeguard.
                if (projectTasks.length === 0) return null; 
                
                return (
                    <div key={project.id}>
                        <h3 className="font-semibold mb-2">{project.name}</h3>
                        <div className="w-full bg-muted rounded-full h-8 relative">
                        <TooltipProvider delayDuration={100}>
                            {projectTasks.map(task => {
                            const start = (parseInt(task.startTime.split(':')[0]) * 60 + parseInt(task.startTime.split(':')[1])) / (24 * 60) * 100;
                            const end = (parseInt(task.endTime.split(':')[0]) * 60 + parseInt(task.endTime.split(':')[1])) / (24 * 60) * 100;

                            return (
                                <Tooltip key={task.id}>
                                    <TooltipTrigger asChild>
                                        <div
                                            className="absolute h-full rounded-full border-2 border-card"
                                            style={{
                                                left: `${start}%`,
                                                width: `${end - start}%`,
                                                backgroundColor: task.color,
                                            }}
                                        />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="font-bold">{task.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {`Time: ${task.startTime} - ${task.endTime}`}
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            )})}
                        </TooltipProvider>
                        </div>
                    </div>
                );
                })
            ) : (
                <div className="text-center py-8 text-muted-foreground">
                    <p>No tasks linked to projects found for today.</p>
                </div>
            )}
            </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
