import { DashboardLayout } from '@/components/DashboardLayout';
import DisputeResolution from '@/components/DisputeResolution';
import { FlaggedRegistryParcels } from '@/components/FlaggedRegistryParcels';

export default function ArbitratorDashboard() {
  return (
    <DashboardLayout
      role="arbitrator"
      title="Arbitrator Dashboard"
      subtitle="Review disputes, evidence, and propose resolutions"
    >
      <div className="space-y-6">
        <FlaggedRegistryParcels />
        <DisputeResolution />
      </div>
    </DashboardLayout>
  );
}
