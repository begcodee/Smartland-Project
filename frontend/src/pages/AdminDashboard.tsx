import { DashboardLayout } from '@/components/DashboardLayout';
import { Analytics } from '@/components/Analytics';
import { RegistrationReview } from '@/components/RegistrationReview';
import { LawsManagement } from '@/components/LawsManagement';
import { VerificationRulesPanel } from '@/components/VerificationRulesPanel';

export default function AdminDashboard() {
  return (
    <DashboardLayout
      role="admin"
      title="Admin Dashboard"
      subtitle="Ghana Lands Commission — system oversight, users, parcels & disputes"
    >
      <div className="space-y-6">
        <VerificationRulesPanel />
        <RegistrationReview />
        <LawsManagement />
        <Analytics />
      </div>
    </DashboardLayout>
  );
}
