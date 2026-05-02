import { DashboardLayout } from '@/components/DashboardLayout';
import { Analytics } from '@/components/Analytics';
import { RegistrationReview } from '@/components/RegistrationReview';

export default function AdminDashboard() {
  return (
    <DashboardLayout
      role="admin"
      title="Admin Dashboard"
    >
      <div className="space-y-6">
        <RegistrationReview />
        <Analytics />
      </div>
    </DashboardLayout>
  );
}
