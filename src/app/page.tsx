
import StudyPlanner from "@/components/tasks/StudyPlanner";
import TaskTimeline from "@/components/tasks/TaskTimeline";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-headline font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Plan your day and focus on your tasks.
        </p>
      </div>
      
      <StudyPlanner />

      <Separator />

      <TaskTimeline />
      
    </div>
  );
}
