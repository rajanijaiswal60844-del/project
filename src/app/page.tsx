import ProjectList from "@/components/projects/ProjectList";
import TaskTimeline from "@/components/tasks/TaskTimeline";

export default function Home() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-headline font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back! Here's an overview of your projects and tasks.
        </p>
      </div>
      
      <TaskTimeline />
      <ProjectList />
    </div>
  );
}
