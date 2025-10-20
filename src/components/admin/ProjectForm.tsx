import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

export default function ProjectForm() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Manage Projects</CardTitle>
                <CardDescription>Add a new project to the dashboard.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="projectName">Project Name</Label>
                    <Input id="projectName" placeholder="e.g., Aura UI Redesign" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="projectDescription">Description</Label>
                    <Textarea id="projectDescription" placeholder="Describe the project..." />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="projectLabels">Labels (comma-separated)</Label>
                    <Input id="projectLabels" placeholder="e.g., UI/UX, Frontend" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="projectImage">Image URL</Label>
                    <Input id="projectImage" placeholder="https://example.com/image.png" />
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full">Add Project</Button>
            </CardFooter>
        </Card>
    );
}
