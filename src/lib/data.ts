export type Project = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  labels: string[];
};

export type Task = {
  id: string;
  projectId: string;
  name: string;
  start: number; // percentage of day
  end: number;   // percentage of day
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

export const tasks: Task[] = [
    { id: 'task-1', projectId: 'proj-1', name: 'Wireframing', start: 0, end: 20 },
    { id: 'task-2', projectId: 'proj-1', name: 'Mockups', start: 22, end: 45 },
    { id: 'task-3', projectId: 'proj-1', name: 'Prototyping', start: 50, end: 80 },
    { id: 'task-4', projectId: 'proj-2', name: 'API Design', start: 5, end: 30 },
    { id: 'task-5', projectId: 'proj-2', name: 'Data Modeling', start: 32, end: 60 },
    { id: 'task-6', projectId: 'proj-2', name: 'Endpoint Dev', start: 61, end: 95 },
    { id: 'task-7', projectId: 'proj-3', name: 'Button Component', start: 0, end: 15 },
    { id: 'task-8', projectId: 'proj-3', name: 'Card Component', start: 16, end: 35 },
    { id: 'task-9', projectId: 'proj-3', name: 'Form Elements', start: 36, end: 70 },
    { id: 'task-10', projectId: 'proj-3', name: 'Documentation', start: 75, end: 100 },
    { id: 'task-11', projectId: 'proj-4', name: 'Research', start: 0, end: 40 },
    { id: 'task-12', projectId: 'proj-4', name: 'Implementation', start: 45, end: 90 },
];
