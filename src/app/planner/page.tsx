
import StudyPlanner from "@/components/tasks/StudyPlanner";
import TaskTimeline from "@/components/tasks/TaskTimeline";

export default function PlannerPage() {
  return (
    <div className="space-y-8">
      <StudyPlanner />
      <TaskTimeline />
    </div>
  );
}
