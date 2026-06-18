import { FinanceGoalsDashboard } from '@/components/dashboards-lazy';
import { FinanceIncomeGate } from '@/components/finance/finance-income-gate';

export default function FinanceGoalsPage() {
  return (
    <FinanceIncomeGate>
      <FinanceGoalsDashboard />
    </FinanceIncomeGate>
  );
}
