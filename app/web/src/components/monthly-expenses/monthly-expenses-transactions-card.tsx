'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { TbCheck, TbDotsVertical, TbPlus } from 'react-icons/tb';
import { MONTHLY_EXPENSES_COPY as copy } from '@/components/monthly-expenses/monthly-expenses-copy';
import { isMutationError } from '@/hooks/use-dashboard-mutation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/cn';
import { NativeDialog } from '@/components/ui/native-dialog';
import { dashboardMainBodyCardPaddingClass } from '@/components/ui/dashboard-two-column-layout';
import { MonthlyExpensesSearchInput } from '@/components/monthly-expenses/monthly-expenses-search-input';
import { ScrollSelect } from '@/components/ui/scroll-select';
import { useAnchoredMenu } from '@/hooks/use-anchored-menu';
import { typeClass, typeToneClass } from '@/lib/typography';
import { formatBrlAmount } from '@/utils/wallet';
import type { ExpensePaymentSource } from '@/types/finance';

export type ExpenseRowVm = {
  id: string;
  date: string;
  categoryId?: string;
  category: string;
  description: string;
  account: string;
  amount: number;
  status: 'paid' | 'pending';
  editable?: boolean;
  deletable?: boolean;
  linkedTransactionId?: string | null;
  linkedCreditCardPurchaseId?: string | null;
  source?: string;
};

const LIST_CHUNK_SIZE = 8;
const INSTALLMENT_OPTIONS = Array.from({ length: 24 }, (_, index) => index + 1);

type MonthlyExpensesTransactionsCardProps = {
  expenses: ExpenseRowVm[];
  categories: Array<{ id: string; label: string }>;
  cards: Array<{ id: string; label: string }>;
  onCreateExpense: (values: {
    title: string;
    amount: number;
    categoryId?: string;
    paymentSource?: ExpensePaymentSource;
    cardId?: string;
    status: 'paid' | 'pending';
    installments?: number;
  }) => Promise<unknown | { error: string }>;
  onUpdateExpense: (
    id: string,
    values: {
      status?: 'paid' | 'pending';
      title?: string;
      amount?: number;
      categoryId?: string;
      account?: string;
    },
  ) => void;
  onDeleteExpense: (
    id: string,
    linkedTransactionId?: string | null,
    linkedCreditCardPurchaseId?: string | null,
  ) => void;
  saving?: boolean;
  vsLastMonth: number;
  className?: string;
  style?: React.CSSProperties;
};

function filterExpenses(expenses: ExpenseRowVm[], query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return expenses;
  return expenses.filter((expense) => {
    const haystack = [
      expense.date,
      expense.category,
      expense.description,
      expense.account,
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(normalized);
  });
}

function StatusBadge({ status }: { status: ExpenseRowVm['status'] }) {
  const paid = status === 'paid';
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5',
        typeClass.micro,
        paid ? 'bg-green/20 text-green' : 'bg-red/20 text-red',
      )}
    >
      {paid ? copy.paid : copy.pending}
    </span>
  );
}

function ExpenseRowActions({
  status,
  statusDisabled = false,
  deleteDisabled = false,
  onToggleStatus,
  onDelete,
}: {
  status: ExpenseRowVm['status'];
  statusDisabled?: boolean;
  deleteDisabled?: boolean;
  onToggleStatus: () => void;
  onDelete: () => void;
}) {
  const paid = status === 'paid';
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { open, setOpen, menuPosition, triggerRef } = useAnchoredMenu({
    menuDataAttribute: 'data-monthly-expense-options-menu',
  });
  const menu =
    open && menuPosition && typeof document !== 'undefined'
      ? createPortal(
          <div
            data-monthly-expense-options-menu
            className="fixed z-50 min-w-36 overflow-hidden rounded-md border border-layer2-half bg-layer1 shadow-lg"
            style={{ top: menuPosition.top, left: menuPosition.left }}
          >
            <button
              type="button"
              disabled={statusDisabled}
              className={cn(
                'block w-full px-3 py-2 text-left hover:bg-layer2-half disabled:cursor-not-allowed disabled:opacity-50',
                typeClass.body,
                typeToneClass.default,
              )}
              onClick={() => {
                if (statusDisabled) return;
                setOpen(false);
                onToggleStatus();
              }}
            >
              {paid ? 'Mark pending' : 'Mark paid'}
            </button>
            <button
              type="button"
              disabled={deleteDisabled}
              className={cn(
                'block w-full px-3 py-2 text-left hover:bg-layer2-half disabled:cursor-not-allowed disabled:opacity-50',
                typeClass.body,
                typeToneClass.accent,
              )}
              onClick={() => {
                if (deleteDisabled) return;
                setOpen(false);
                setDeleteOpen(true);
              }}
            >
              Delete
            </button>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <div className="inline-flex items-center gap-1 rounded-lg bg-layer2-half p-0.5">
        <button
          type="button"
          disabled={statusDisabled}
          aria-label={paid ? 'Unmark as paid' : 'Mark as paid'}
          className={cn(
            'inline-flex h-7 w-7 items-center justify-center rounded-md transition disabled:cursor-not-allowed disabled:opacity-50',
            paid
              ? 'bg-green/20 text-green hover:bg-green/30'
              : 'text-text/50 hover:bg-layer2 hover:text-text',
          )}
          onClick={onToggleStatus}
        >
          <TbCheck className="h-3.5 w-3.5" aria-hidden />
        </button>
        <button
          ref={triggerRef}
          type="button"
          disabled={statusDisabled && deleteDisabled}
          aria-label="More options"
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-text/50 transition hover:bg-layer2 hover:text-text disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => setOpen((value) => !value)}
        >
          <TbDotsVertical className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
      {menu}
      <NativeDialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <form
          method="dialog"
          className="flex flex-col gap-4 p-5"
          onSubmit={(event) => {
            event.preventDefault();
            onDelete();
            setDeleteOpen(false);
          }}
        >
          <div>
            <p className={cn(typeClass.title, typeToneClass.default)}>Delete transaction</p>
            <p className={cn('mt-2', typeClass.body, typeToneClass.muted60)}>
              Are you sure you want to delete this transaction?
            </p>
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="destructive" size="sm" className="flex-1">
              Delete
            </Button>
            <Button type="button" variant="secondary" size="sm" className="flex-1" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </NativeDialog>
    </>
  );
}

export function MonthlyExpensesTransactionsCard({
  expenses,
  categories,
  cards,
  onCreateExpense,
  onUpdateExpense,
  onDeleteExpense,
  saving = false,
  vsLastMonth,
  className,
  style,
}: MonthlyExpensesTransactionsCardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(LIST_CHUNK_SIZE);
  const [createOpen, setCreateOpen] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formPaymentSource, setFormPaymentSource] = useState<ExpensePaymentSource>('CASH');
  const [formCardId, setFormCardId] = useState('');
  const [formStatus, setFormStatus] = useState<'paid' | 'pending'>('paid');
  const [formInstallments, setFormInstallments] = useState(1);
  const [createError, setCreateError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const filteredExpenses = useMemo(
    () => filterExpenses(expenses, searchQuery),
    [expenses, searchQuery],
  );

  const visibleExpenses = filteredExpenses.slice(0, visibleCount);
  const hasMore = visibleCount < filteredExpenses.length;
  const vsLastMonthLabel =
    vsLastMonth === 0
      ? 'No change vs last month'
      : `${vsLastMonth < 0 ? '↓' : '↑'} ${Math.abs(vsLastMonth).toFixed(1)}% vs last month`;
  const vsLastMonthTone =
    vsLastMonth === 0
      ? typeToneClass.muted60
      : vsLastMonth < 0
        ? typeToneClass.negative
        : typeToneClass.positive;

  useEffect(() => {
    const root = scrollRef.current;
    const target = loadMoreRef.current;
    if (!root || !target || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisibleCount((count) =>
            Math.min(count + LIST_CHUNK_SIZE, filteredExpenses.length),
          );
        }
      },
      { root, rootMargin: '120px' },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [filteredExpenses.length, hasMore]);

  const canCreateExpense =
    formTitle.trim().length > 0 &&
    Number.isFinite(Number(formAmount.replace(',', '.'))) &&
    Number(formAmount.replace(',', '.')) > 0 &&
    formInstallments >= 1 &&
    (formPaymentSource !== 'CARD' || formCardId.length > 0);
  const isExtraIncome = formPaymentSource === 'DEPOSIT_EXTRA_INCOME';
  const isCardPurchase = formPaymentSource === 'CARD';

  const resetCreateForm = () => {
    setFormTitle('');
    setFormAmount('');
    setFormCategoryId('');
    setFormPaymentSource('CASH');
    setFormCardId('');
    setFormStatus('paid');
    setFormInstallments(1);
    setCreateError(null);
  };

  return (
    <Card
      className={cn(
        'flex min-h-0 flex-1 flex-col gap-12 overflow-hidden',
        dashboardMainBodyCardPaddingClass,
        className,
      )}
      style={style}
    >
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2.5">
          <p className={cn('min-w-0 truncate', typeClass.title, typeToneClass.default)}>
            {copy.transactions}
          </p>
          <span className={cn('shrink-0 tabular-nums', typeClass.caption, vsLastMonthTone)}>
            {vsLastMonthLabel}
          </span>
        </div>

        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2 sm:flex-nowrap">
          <MonthlyExpensesSearchInput
            value={searchQuery}
            onChange={(value) => {
              setSearchQuery(value);
              setVisibleCount(LIST_CHUNK_SIZE);
            }}
            disabled={false}
          />

          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={saving}
            className="h-10 gap-1.5"
            onClick={() => setCreateOpen(true)}
          >
            <TbPlus className="h-4 w-4 shrink-0" aria-hidden />
            {copy.newTransaction}
          </Button>
        </div>
      </div>

      <div ref={scrollRef} className="scrollbar-none min-h-0 flex-1 overflow-auto">
          {filteredExpenses.length === 0 ? (
            <div
              className={cn(
                'flex h-full min-h-[12rem] items-center justify-center rounded-[5px] bg-layer2-half px-4',
                typeClass.body,
                typeToneClass.muted60,
              )}
            >
              {searchQuery.trim() ? copy.noTransactionsFound : copy.noTransactions}
            </div>
          ) : (
            <table
              className={cn(
                'w-full min-w-[44rem] table-fixed border-collapse [&_td]:align-middle [&_th]:align-middle',
                typeClass.caption,
              )}
            >
              <colgroup>
                <col className="w-[5.5rem]" />
                <col className="w-[7.5rem]" />
                <col />
                <col className="w-[9.5rem]" />
                <col className="w-[8.5rem]" />
                <col className="w-[5.5rem]" />
                <col className="w-[5.5rem]" />
              </colgroup>
              <thead className="sticky top-0 z-10 bg-layer1">
                <tr className="border-b border-grey text-text/55">
                  <th className={cn('pb-3 pr-2 pt-1 text-left', typeClass.label)}>Date</th>
                  <th className={cn('pb-3 px-2 pt-1 text-left', typeClass.label)}>Category</th>
                  <th className={cn('pb-3 px-2 pt-1 text-left', typeClass.label)}>Description</th>
                  <th className={cn('pb-3 px-2 pt-1 text-left', typeClass.label)}>Account</th>
                  <th className={cn('pb-3 px-2 pt-1 text-right', typeClass.label)}>Amount</th>
                  <th className={cn('pb-3 px-2 pt-1 text-center', typeClass.label)}>Status</th>
                  <th className={cn('pb-3 pl-2 pt-1 text-center', typeClass.label)}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleExpenses.map((expense) => (
                  <tr key={expense.id} className="border-b border-grey/60 transition hover:bg-layer2-half/40">
                    <td className={cn('py-3 pr-2 whitespace-nowrap', typeClass.micro, typeToneClass.muted60)}>
                      {expense.date}
                    </td>
                    <td className={cn('px-2 py-3 truncate', typeClass.micro, typeToneClass.default)}>
                      {expense.category}
                    </td>
                    <td className={cn('px-2 py-3 truncate', typeClass.bodyStrong)}>{expense.description}</td>
                    <td className={cn('px-2 py-3 truncate', typeClass.micro, typeToneClass.muted60)}>
                      {expense.account}
                    </td>
                    <td className="px-2 py-3">
                      <p
                        className={cn(
                          'whitespace-nowrap text-right tabular-nums',
                          typeClass.label,
                          expense.amount >= 0 ? typeToneClass.positive : typeToneClass.negative,
                        )}
                      >
                        {formatBrlAmount(expense.amount, { signed: true })}
                      </p>
                    </td>
                    <td className="px-2 py-3 text-center">
                      <StatusBadge status={expense.status} />
                    </td>
                    <td className="py-3 pl-2 text-center">
                      <ExpenseRowActions
                        status={expense.status}
                        statusDisabled={saving || expense.editable === false}
                        deleteDisabled={saving || expense.deletable !== true}
                        onToggleStatus={() =>
                          onUpdateExpense(expense.id, {
                            status: expense.status === 'paid' ? 'pending' : 'paid',
                          })
                        }
                        onDelete={() =>
                          onDeleteExpense(
                            expense.id,
                            expense.linkedTransactionId,
                            expense.linkedCreditCardPurchaseId,
                          )
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {hasMore ? <div ref={loadMoreRef} className="h-8 w-full shrink-0" aria-hidden /> : null}
      </div>

      <NativeDialog
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          resetCreateForm();
        }}
      >
        <form
          method="dialog"
          className="flex flex-col gap-4 p-5"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!canCreateExpense || saving) return;
            setCreateError(null);
            const result = await onCreateExpense({
              title: formTitle.trim(),
              amount: Number(formAmount.replace(',', '.')),
              categoryId: isExtraIncome ? undefined : formCategoryId || undefined,
              paymentSource: formPaymentSource,
              cardId: isCardPurchase ? formCardId : undefined,
              status: formStatus,
              installments: isCardPurchase ? formInstallments : undefined,
            });
            if (isMutationError(result)) {
              setCreateError(result.error);
              return;
            }
            setCreateOpen(false);
            resetCreateForm();
          }}
        >
          <p className={cn(typeClass.title, typeToneClass.default)}>{copy.newTransaction}</p>
          {createError ? (
            <p className={cn(typeClass.caption, typeToneClass.negative)} role="alert">
              {createError}
            </p>
          ) : null}

          <label className={cn('flex flex-col gap-1.5', typeClass.caption)}>
            <span className={typeToneClass.muted60}>Description</span>
            <input
              type="text"
              autoFocus
              value={formTitle}
              onChange={(event) => setFormTitle(event.target.value)}
              className="h-9 rounded-md bg-layer2 px-3 text-text outline-none focus-visible:ring-2 focus-visible:ring-red/50"
              placeholder={isExtraIncome ? 'e.g. Freelance payment' : isCardPurchase ? 'e.g. Online purchase' : 'e.g. Groceries'}
            />
          </label>

          <label className={cn('flex flex-col gap-1.5', typeClass.caption)}>
            <span className={typeToneClass.muted60}>Amount</span>
            <input
              type="text"
              inputMode="decimal"
              value={formAmount}
              onChange={(event) =>
                setFormAmount(event.target.value.replace(/[^\d.,]/g, ''))
              }
              className="h-9 rounded-md bg-layer2 px-3 text-text outline-none focus-visible:ring-2 focus-visible:ring-red/50"
              placeholder="0.00"
            />
          </label>

          {isCardPurchase ? (
            <label className={cn('flex flex-col gap-1.5', typeClass.caption)}>
              <span className={typeToneClass.muted60}>Installments</span>
              <ScrollSelect
                value={formInstallments}
                onChange={setFormInstallments}
                options={INSTALLMENT_OPTIONS}
                formatOption={(count) => (count === 1 ? '1x — Pay in full' : `${count}x`)}
              />
            </label>
          ) : null}

          <label className={cn('flex flex-col gap-1.5', typeClass.caption)}>
            <span className={typeToneClass.muted60}>Category</span>
            <select
              value={formCategoryId}
              disabled={isExtraIncome}
              onChange={(event) => setFormCategoryId(event.target.value)}
              className="h-9 rounded-md bg-layer2 px-3 text-text outline-none focus-visible:ring-2 focus-visible:ring-red/50"
            >
              <option value="">{isExtraIncome ? 'Income does not use category' : 'No category'}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </label>

          <label className={cn('flex flex-col gap-1.5', typeClass.caption)}>
            <span className={typeToneClass.muted60}>Conta / origem</span>
            <select
              value={formPaymentSource}
              onChange={(event) => {
                const nextSource = event.target.value as ExpensePaymentSource;
                setFormPaymentSource(nextSource);
                if (nextSource === 'DEPOSIT_EXTRA_INCOME') setFormCategoryId('');
                if (nextSource !== 'CARD') setFormCardId('');
                if (nextSource === 'CARD' && cards[0] && !formCardId) {
                  setFormCardId(cards[0].id);
                }
              }}
              className="h-9 rounded-md bg-layer2 px-3 text-text outline-none focus-visible:ring-2 focus-visible:ring-red/50"
            >
              <option value="CASH">Dinheiro</option>
              <option value="DEPOSIT_EXTRA_INCOME">Renda extra</option>
              <option value="CARD">Cartão de crédito</option>
            </select>
          </label>

          {isCardPurchase ? (
            <label className={cn('flex flex-col gap-1.5', typeClass.caption)}>
              <span className={typeToneClass.muted60}>Cartão</span>
              <select
                value={formCardId}
                onChange={(event) => setFormCardId(event.target.value)}
                className="h-9 rounded-md bg-layer2 px-3 text-text outline-none focus-visible:ring-2 focus-visible:ring-red/50"
              >
                {cards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <label className={cn('flex flex-col gap-1.5', typeClass.caption)}>
            <span className={typeToneClass.muted60}>Status</span>
            <select
              value={formStatus}
              onChange={(event) => setFormStatus(event.target.value as 'paid' | 'pending')}
              className="h-9 rounded-md bg-layer2 px-3 text-text outline-none focus-visible:ring-2 focus-visible:ring-red/50"
            >
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
          </label>

          <div className="flex gap-2">
            <Button type="submit" variant="primary" size="sm" disabled={saving || !canCreateExpense} className="flex-1">
              {saving ? copy.saving : copy.saveTransaction}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={() => {
                setCreateOpen(false);
                resetCreateForm();
              }}
            >
              {copy.cancel}
            </Button>
          </div>
        </form>
      </NativeDialog>
    </Card>
  );
}
