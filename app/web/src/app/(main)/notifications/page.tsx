import { NotificationsDashboard } from '@/components/dashboards-lazy';
import { FinanceIncomeGate } from '@/components/finance/finance-income-gate';

export default function NotificationsPage() {
  return (
    <FinanceIncomeGate>
      <NotificationsDashboard />
    </FinanceIncomeGate>
  );
}
