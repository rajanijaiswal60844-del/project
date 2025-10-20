
import AdminGate from "@/components/admin/AdminGate";
import FaceUploader from "@/components/admin/FaceUploader";
import ProjectManagement from "@/components/admin/ProjectManagement";
import { Separator } from "@/components/ui/separator";

export default function AdminPage() {
  return (
    <AdminGate>
      <div className="space-y-8 h-[calc(100vh-10rem)] overflow-y-auto pr-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-headline font-bold text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground mt-2">
            Manage projects and user identity validation.
          </p>
        </div>

        <Separator />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ProjectManagement />
            <FaceUploader />
        </div>
      </div>
    </AdminGate>
  );
}
