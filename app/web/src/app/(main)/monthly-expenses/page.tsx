import { MonthlyExpensesDashboard } from '@/components/dashboards-lazy';
import { FinanceIncomeGate } from '@/components/finance/finance-income-gate';

export default function MonthlyExpensesPage() {
  return (
    <FinanceIncomeGate>
      <MonthlyExpensesDashboard />
    </FinanceIncomeGate>
  );
}
