import { CrudModule } from "@/components/dashboard/CrudModule";
import { socialRecords } from "@/lib/module-records";

export default function SocialPage() {
  return (
    <CrudModule
      title="Social"
      description="Plan scheduled posts, manage drafts, review published content, and monitor engagement."
      records={socialRecords}
      primaryAction="Add Post"
      searchPlaceholder="Search posts..."
      statusOptions={["Scheduled", "Draft", "Published"]}
    />
  );
}
