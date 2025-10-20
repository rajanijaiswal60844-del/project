export type Project = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  labels: string[];
};

export type StudyTask = {
  id: string;
  name: string;
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  color: string;
  projectId?: string; // Optional: Link to a project
};


export const labels: string[] = ["UI/UX", "Backend", "Frontend", "AI/ML", "Design"];

export const projects: Project[] = [
  {
    id: "proj-1",
    name: "Aura UI Redesign",
    description: "Complete overhaul of the main user interface for the Aura platform, focusing on user experience and modern design principles.",
    imageUrl: "https://picsum.photos/seed/pf1/600/400",
    imageHint: "abstract technology",
    labels: ["UI/UX", "Design", "Frontend"],
  },
  {
    id: "proj-2",
    name: "Cognitive Search API",
    description: "Developing a new backend API for advanced, AI-powered search capabilities within our product suite.",
    imageUrl: "https://picsum.photos/seed/pf2/600/400",
    imageHint: "futuristic interface",
    labels: ["Backend", "AI/ML"],
  },
  {
    id: "proj-3",
    name: "Frontend Component Library",
    description: "Building a new reusable component library in React to standardize the look and feel across all web applications.",
    imageUrl: "https://picsum.photos/seed/pf3/600/400",
    imageHint: "glowing circuits",
    labels: ["Frontend", "Design"],
  },
  {
    id: "proj-4",
    name: "ML Model Optimization",
    description: "Research and implementation of new techniques to optimize the performance and accuracy of our core machine learning models.",
    imageUrl: "https://picsum.photos/seed/pf4/600/400",
    imageHint: "brain network",
    labels: ["AI/ML"],
  },
];

export const initialTasks: StudyTask[] = [
    { id: 'task-1', name: 'Math Practice', startTime: '09:00', endTime: '10:30', color: 'hsl(var(--primary))' },
    { id: 'task-2', name: 'Chemistry Review', startTime: '11:00', endTime: '12:00', color: 'hsl(var(--accent))' },
    { id: 'task-3', name: 'History Reading', startTime: '14:30', endTime: '16:00', color: 'hsl(var(--secondary))' },
];
