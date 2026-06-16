import { HomestayForm } from "@/components/admin/homestay-form";
import { PageHeader } from "@/components/layout/page-header";

export default function NewHomestayPage() {
  return (
    <div>
      <PageHeader title="New homestay" description="Add the basics. A starter room is created automatically." />
      <HomestayForm />
    </div>
  );
}
