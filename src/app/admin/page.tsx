
import AdminGate from "@/components/admin/AdminGate";
import FaceUploader from "@/components/admin/FaceUploader";
import DataManagement from "@/components/admin/DataManagement";
import ProjectManagement from "@/components/admin/ProjectManagement";
import VerificationRecords from "@/components/admin/VerificationRecords";

export default function AdminPage() {
  return (
    <AdminGate>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-headline font-bold text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground mt-2">
            Manage projects, user identity, and application data.
          </p>
        </div>
        
        <div className="space-y-8">
            <ProjectManagement />
            <FaceUploader />
            <VerificationRecords />
            <DataManagement />
        </div>
      </div>
    </AdminGate>
  );
}
