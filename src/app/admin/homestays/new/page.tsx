import { HomestayForm } from "@/components/admin/homestay-form";
import { PageHeader } from "@/components/layout/page-header";

export default function NewHomestayPage() {
  return (
    <div>
      <PageHeader title="Cơ sở mới" description="Nhập thông tin cơ bản. Hệ thống sẽ tự tạo một phòng mẫu." />
      <HomestayForm />
    </div>
  );
}
