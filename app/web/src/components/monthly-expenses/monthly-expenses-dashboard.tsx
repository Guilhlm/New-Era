'use client';

import {
  DashboardSidebarColumn,
  DashboardTwoColumnLayout,
  dashboardGridArea,
} from '@/components/ui/dashboard-two-column-layout';
import { MonthlyExpensesCategoriesCard } from '@/components/monthly-expenses/monthly-expenses-categories-card';
import { MonthlyExpensesCreditCards } from '@/components/monthly-expenses/monthly-expenses-credit-cards';
import { MonthlyExpensesTransactionsCard } from '@/components/monthly-expenses/monthly-expenses-transactions-card';
import { PlanHeaderCard } from '@/components/ui/plan-header-card';
import { StatProgressCard } from '@/components/ui/stat-progress-card';
import { WeekdayNavigator } from '@/components/ui/weekday-navigator';
import { useMonthlyExpensesDashboardState } from '@/hooks/use-monthly-expenses-dashboard-state';
import { formatBrlAmount } from '@/utils/wallet';

export function MonthlyExpensesDashboard() {
  const state = useMonthlyExpensesDashboardState();
  const totals = state.data.totals;
  const monthlySpending = -totals.spent;
  const budgetUsage = Math.max(0, totals.spent);
  const spentPercent =
    totals.budget > 0 ? Math.round((budgetUsage / totals.budget) * 100) : 0;
  const budgetRemainingPercent =
    totals.budget > 0
      ? Math.round(((totals.budget - budgetUsage) / totals.budget) * 100)
      : 0;
  const remainingPercent =
    totals.income > 0 ? Math.round((Math.max(0, totals.remaining) / totals.income) * 100) : 0;

  return (
    <DashboardTwoColumnLayout>
      <PlanHeaderCard
        title="Monthly Expenses"
        className="h-full min-h-0"
        style={dashboardGridArea('main', 'header')}
        rightSlot={
          <WeekdayNavigator
            weekdayLabel={state.data.monthLabel}
            weekdayShortLabel={state.data.monthShortLabel}
            onPrevDay={state.actions.prevMonth}
            onNextDay={state.actions.nextMonth}
          />
        }
        statsSlot={
          <>
            <StatProgressCard
              className="min-w-0"
              data={{
                label: 'Monthly spending',
                valueLabel: formatBrlAmount(monthlySpending, { signed: true }),
                percent: spentPercent,
                barClassName: monthlySpending >= 0 ? 'bg-green' : 'bg-red',
                valueClassName: monthlySpending >= 0 ? 'text-green' : 'text-red',
                footerRight: `Goals + fixed: ${formatBrlAmount(totals.fixedCommitments)}`,
              }}
            />
            <StatProgressCard
              className="min-w-0"
              data={{
                label: 'Budget',
                valueLabel: formatBrlAmount(totals.budget),
                percent: budgetRemainingPercent,
                barClassName: budgetRemainingPercent > 25 ? 'bg-green' : 'bg-red',
                footerRight: `Salary ${formatBrlAmount(totals.income)} + cards ${formatBrlAmount(totals.cardLimit)}`,
              }}
            />
            <StatProgressCard
              className="min-w-0"
              data={{
                label: 'Remaining balance',
                valueLabel: formatBrlAmount(totals.remaining),
                percent: remainingPercent,
                barClassName: totals.remaining >= 0 ? 'bg-green' : 'bg-red',
                valueClassName: totals.remaining >= 0 ? 'text-green' : 'text-red',
                footerRight: totals.remaining >= 0 ? 'Available from salary' : 'Above salary',
              }}
            />
          </>
        }
      />

      <div
        className="grid h-full min-h-0 grid-rows-[19rem_minmax(0,1fr)] gap-2.5 overflow-hidden"
        style={dashboardGridArea('main', 'body')}
      >
        <MonthlyExpensesCreditCards
          cards={state.data.cards}
          saving={state.ui.saving}
          onCreateCard={(values) =>
            state.actions.createCard({
              holderName: values.holder,
              lastFour: values.lastFour,
              limitTotal: values.limit,
              limitUsage: values.used,
              dueDay: values.dueDay,
              brand: values.brand,
              color: values.color,
              type: 'CREDIT',
            })
          }
          onUpdateCard={(id, values) =>
            state.actions.updateCard(id, {
              holderName: values.holder,
              lastFour: values.lastFour,
              limitTotal: values.limit,
              limitUsage: values.used,
              dueDay: values.dueDay,
              brand: values.brand,
              color: values.color,
              type: 'CREDIT',
            })
          }
          onDeleteCard={state.actions.deleteCard}
          onPayInvoice={state.actions.payCardInvoice}
          salaryRemaining={totals.remaining}
        />
        <MonthlyExpensesTransactionsCard
          expenses={state.data.expenses}
          categories={state.data.categories.map((item) => ({ id: item.id, label: item.label }))}
          cards={state.data.cards.map((item) => ({
            id: item.id,
            label: `${item.brand === 'mastercard' ? 'Mastercard' : 'Visa'} •••• ${item.lastFour}`,
          }))}
          onCreateExpense={state.actions.createExpense}
          onUpdateExpense={state.actions.updateExpense}
          onDeleteExpense={state.actions.deleteExpense}
          saving={state.ui.saving}
          vsLastMonth={totals.vsLastMonth}
          className="h-full min-h-0"
        />
      </div>

      <DashboardSidebarColumn>
        <MonthlyExpensesCategoriesCard
          categories={state.data.categories}
          onCreate={state.actions.createCategory}
          onUpdate={(id, values) =>
            state.actions.updateCategory(id, {
              name: values.name,
              budget: values.budget,
              spentAdjustment: values.spentAdjustment,
            })
          }
          onDelete={state.actions.deleteCategory}
          saving={state.ui.saving}
          className="h-full min-h-0"
        />
      </DashboardSidebarColumn>
    </DashboardTwoColumnLayout>
  );
}
