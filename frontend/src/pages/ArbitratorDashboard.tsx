import { DashboardLayout } from '@/components/DashboardLayout';
import DisputeResolution from '@/components/DisputeResolution';

export default function ArbitratorDashboard() {
  return (
    <DashboardLayout
      role="arbitrator"
      title="Arbitrator Dashboard"
      subtitle="Review disputes, evidence, and propose resolutions"
    >
      <DisputeResolution />
    </DashboardLayout>
  );
}
