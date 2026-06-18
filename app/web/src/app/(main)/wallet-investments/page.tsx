import { WalletDashboard } from '@/components/dashboards-lazy';
import { FinanceIncomeGate } from '@/components/finance/finance-income-gate';

export default function WalletInvestmentsPage() {
  return (
    <FinanceIncomeGate>
      <WalletDashboard />
    </FinanceIncomeGate>
  );
}
