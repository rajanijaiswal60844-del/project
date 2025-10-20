import AdminGate from "@/components/admin/AdminGate";
import FaceUploader from "@/components/admin/FaceUploader";
import ProjectForm from "@/components/admin/ProjectForm";
import { Separator } from "@/components/ui/separator";

export default function AdminPage() {
  return (
    <AdminGate>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-headline font-bold text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground mt-2">
            Manage projects and user identity validation.
          </p>
        </div>

        <Separator />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ProjectForm />
            <FaceUploader />
        </div>
      </div>
    </AdminGate>
  );
}
