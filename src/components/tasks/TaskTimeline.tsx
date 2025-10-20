import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { projects, tasks } from "@/lib/data";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

export default function TaskTimeline() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Daily Task Timeline</CardTitle>
        <CardDescription>A visual overview of tasks scheduled for today across all projects.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {projects.map(project => {
            const projectTasks = tasks.filter(task => task.projectId === project.id);
            return (
              <div key={project.id}>
                <h3 className="font-semibold mb-2">{project.name}</h3>
                <div className="w-full bg-muted rounded-full h-8 relative">
                  <TooltipProvider delayDuration={100}>
                    {projectTasks.map(task => (
                        <Tooltip key={task.id}>
                            <TooltipTrigger asChild>
                                <div
                                    className="absolute h-full bg-primary/80 hover:bg-primary rounded-full border-2 border-card"
                                    style={{
                                        left: `${task.start}%`,
                                        width: `${task.end - task.start}%`,
                                    }}
                                />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="font-bold">{task.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {`Time: ${task.start}% - ${task.end}%`}
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                  </TooltipProvider>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
