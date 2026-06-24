'use client';

import {
  WalletDashboardGrid,
  walletDashboardGridArea,
} from '@/components/ui/wallet-dashboard-grid';
import { WalletCashDialog } from '@/components/wallet/wallet-cash-dialog';
import { WalletInvestmentEditSheet } from '@/components/wallet/wallet-investment-edit-sheet';
import { WalletInvestmentsCard } from '@/components/wallet/wallet-investments-card';
import { WalletPortfolioAllocationCard } from '@/components/wallet/wallet-portfolio-allocation-card';
import { WalletPortfolioInsightCard } from '@/components/wallet/wallet-portfolio-insight-card';
import { WalletPositionRegisterDialog } from '@/components/wallet/wallet-position-register-dialog';
import { WalletRecentTransactionsCard } from '@/components/wallet/wallet-recent-transactions-card';
import { WalletStatCard } from '@/components/wallet/wallet-stat-card';
import { WalletTradeDialog } from '@/components/wallet/wallet-trade-dialog';
import { useWalletDashboardState } from '@/hooks/use-wallet-dashboard-state';

const STAT_SLOTS = ['stat-1', 'stat-2', 'stat-3'] as const;

export function WalletDashboard() {
  const state = useWalletDashboardState();

  return (
    <>
      {state.ui.error ? (
        <p className="type-body mb-2.5 shrink-0 text-red" role="alert">
          {state.ui.error} Run{' '}
          <code className="type-caption rounded bg-layer2 px-1 py-0.5">npx prisma migrate deploy</code>{' '}
          in <code className="type-caption rounded bg-layer2 px-1 py-0.5">app/api</code> if this is a fresh setup.
        </p>
      ) : null}

      <WalletDashboardGrid>
        <div className="grid grid-cols-2 gap-2.5 [grid-auto-rows:1fr] lg:contents">
          {state.data.stats.map((stat, index) => (
            <WalletStatCard
              key={stat.id}
              data={stat}
              ui={{
                currency: state.ui.currency,
                fxRate: state.data.fxRate,
                hidden: stat.showEye ? state.ui.balanceHidden : false,
              }}
              actions={{
                onToggleHidden: stat.showEye ? state.actions.toggleBalanceHidden : undefined,
                onDeposit: stat.footerRight.kind === 'action' ? state.actions.openDeposit : undefined,
                onCurrencyChange: state.actions.setCurrency,
              }}
              className="h-full min-h-[168px]"
              style={walletDashboardGridArea(STAT_SLOTS[index])}
            />
          ))}

          <WalletPortfolioInsightCard
            data={state.data.portfolioInsight}
            className="h-full min-h-[168px]"
            style={walletDashboardGridArea('stat-4')}
          />
        </div>

        <WalletPortfolioAllocationCard
          data={{
            title: 'My Portfolio Allocation',
            centerPct: state.data.allocation.centerPct,
            centerCaption: state.data.allocation.centerCaption,
            segments: state.data.allocation.segments,
            performance: state.data.allocation.performance,
          }}
          ui={{
            period: state.ui.performancePeriod,
            periods: state.data.performancePeriods,
            loading: state.ui.loading,
            currency: state.ui.currency,
            fxRate: state.data.fxRate,
          }}
          actions={{
            onPeriodChange: state.actions.setPerformancePeriod,
          }}
          className="min-h-[280px] lg:min-h-0"
          style={walletDashboardGridArea('main')}
        />

        <WalletInvestmentsCard
          data={{
            title: 'Market',
            rows: state.data.investments,
            tabs: state.data.investmentTabs,
          }}
          ui={{
            activeTab: state.ui.investmentTab,
            currency: state.ui.currency,
            fxRate: state.data.fxRate,
            quotedAt: state.data.marketQuotedAt,
            total: state.data.marketTotal,
            loading: state.ui.marketLoading,
            refreshing: state.ui.marketFetching,
            loadingMore: state.ui.marketLoadingMore,
            hasMore: state.ui.marketHasMore,
            highlightedTicker: state.ui.highlightedTicker,
            stale: state.data.marketStale,
          }}
          actions={{
            onTabChange: state.actions.setInvestmentTab,
            onCurrencyChange: state.actions.setCurrency,
            onRegisterPosition: () => state.actions.openRegisterPosition(),
            onLoadMore: state.actions.loadMoreMarketRows,
            onSearchSelect: state.actions.selectMarketSearchResult,
            onRegisterPositionForRow: (row) => state.actions.openRegisterPosition(row),
            onEditPosition: state.actions.openEditPosition,
            onDeletePosition: (row) => row.id && state.actions.deletePosition(row.id),
            onBuyInvestment: (row) => state.actions.openTrade(row, 'BUY'),
            onSellInvestment: (row) => state.actions.openTrade(row, 'SELL'),
          }}
          className="min-h-[320px] lg:min-h-0"
          style={walletDashboardGridArea('bottom-left')}
        />

        <WalletRecentTransactionsCard
          data={{
            title: 'Recent Transactions',
            transactions: state.data.transactions,
          }}
          ui={{
            loading: state.ui.loading,
            currency: state.ui.currency,
            fxRate: state.data.fxRate,
          }}
          className="min-h-[320px] lg:min-h-0"
          style={walletDashboardGridArea('bottom-right')}
        />
      </WalletDashboardGrid>

      <WalletPositionRegisterDialog
        open={state.ui.positionDialogOpen}
        saving={state.ui.saving}
        rows={state.data.investments}
        currency={state.ui.currency}
        fxRate={state.data.fxRate}
        preselectedRow={state.ui.positionPresetRow}
        onClose={state.actions.closeRegisterPosition}
        onRegister={state.actions.registerPosition}
      />

      <WalletInvestmentEditSheet
        open={Boolean(state.ui.editInvestment)}
        investment={state.ui.editInvestment}
        saving={state.ui.saving}
        currency={state.ui.currency}
        onClose={state.actions.closeEditPosition}
        onDelete={state.actions.deletePosition}
      />

      <WalletTradeDialog
        open={Boolean(state.ui.tradeRow)}
        saving={state.ui.saving}
        action={state.ui.tradeAction}
        row={state.ui.tradeRow}
        currency={state.ui.currency}
        fxRate={state.data.fxRate}
        availableBalanceUsdt={state.data.walletCashAvailable}
        investmentTab={state.ui.investmentTab}
        onClose={state.actions.closeTrade}
        onConfirm={state.actions.tradeMarket}
        onDeposit={state.actions.openDeposit}
      />

      <WalletCashDialog
        key={state.ui.cashDialogMode}
        open={state.ui.cashDialogOpen}
        saving={state.ui.saving}
        defaultMode={state.ui.cashDialogMode}
        fxRate={state.data.brlFxRate}
        availableBalanceUsdt={state.data.walletCashAvailable}
        maxDepositBrl={state.data.monthlySalaryRemaining}
        onClose={state.actions.closeCashDialog}
        onSubmit={state.actions.submitCash}
      />
    </>
  );
}
