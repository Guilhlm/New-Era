'use client';

import { useMemo, useState } from 'react';
import { MdEdit } from 'react-icons/md';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/cn';
import {
  sidebarContentTopAlignClass,
  sidebarDayListFooterReserveClass,
} from '@/components/ui/sidebar-day-row';
import { MonthlyExpensesCategoryCard } from '@/components/monthly-expenses/monthly-expenses-category-card';
import { MonthlyExpensesCategoryDialog } from '@/components/monthly-expenses/monthly-expenses-category-dialog';
import { MonthlyExpensesCategoryOptionsMenu } from '@/components/monthly-expenses/monthly-expenses-category-options-menu';
import { typeClass, typeToneClass } from '@/lib/typography';
import { formatBrlAmount } from '@/utils/wallet';

export type ExpenseCategoryVm = {
  id: string;
  label: string;
  spent: number;
  budget: number;
  isLocked?: boolean;
};

type MonthlyExpensesCategoriesCardProps = {
  categories: ExpenseCategoryVm[];
  onCreate: (values: { name: string; budget: number }) => Promise<unknown> | unknown;
  onUpdate: (
    categoryId: string,
    values: { name?: string; budget?: number; spentAdjustment?: number },
  ) => Promise<unknown> | unknown;
  onDelete: (categoryId: string) => Promise<unknown> | unknown;
  saving?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export function MonthlyExpensesCategoriesCard({
  categories,
  onCreate,
  onUpdate,
  onDelete,
  saving = false,
  className,
  style,
}: MonthlyExpensesCategoriesCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editingCategory, setEditingCategory] = useState<ExpenseCategoryVm | null>(null);

  const categoryTotal = categories.reduce((sum, c) => sum + c.spent, 0);

  const openCreate = () => {
    setDialogMode('create');
    setEditingCategory(null);
    setDialogOpen(true);
  };

  const openEdit = (category: ExpenseCategoryVm) => {
    setDialogMode('edit');
    setEditingCategory(category);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingCategory(null);
  };

  const handleCreateOrUpdate = (values: { name: string; budget: number; spentAdjustment?: number }) => {
    if (dialogMode === 'create') {
      void onCreate({ name: values.name, budget: values.budget });
    } else if (editingCategory) {
      void onUpdate(editingCategory.id, {
        name: values.name,
        budget: values.budget,
        spentAdjustment: values.spentAdjustment,
      });
    }
    closeDialog();
  };

  const handleRename = (categoryId: string, name: string) => {
    void onUpdate(categoryId, { name });
  };

  const handleDelete = (categoryId: string) => {
    const target = categories.find((cat) => cat.id === categoryId);
    if (target?.isLocked) return;
    void onDelete(categoryId);
  };

  const sortedCategories = useMemo(
    () =>
      [...categories].sort((a, b) => {
        if (Boolean(a.isLocked) !== Boolean(b.isLocked)) {
          return a.isLocked ? -1 : 1;
        }
        return a.label.localeCompare(b.label, 'en-US');
      }),
    [categories],
  );

  const dialogInitial = useMemo(
    () => ({
      name: editingCategory?.label ?? '',
      budget: editingCategory ? String(editingCategory.budget) : '',
      spent: editingCategory?.spent,
      locked: editingCategory?.isLocked,
    }),
    [editingCategory],
  );

  return (
    <>
      <Card className={cn('flex h-full min-h-0 flex-col overflow-hidden p-5 lg:p-6', className)} style={style}>
        <div className="flex shrink-0 items-center justify-between gap-3">
          <h2 className={cn('min-w-0 truncate', typeClass.title, typeToneClass.default)}>By category</h2>
          <p className={cn('shrink-0 tabular-nums', typeClass.caption, typeToneClass.muted60)}>
            {formatBrlAmount(categoryTotal)} spent
          </p>
        </div>

        <div
          className={cn(
            'scrollbar-none flex min-h-0 flex-1 flex-col gap-2 overflow-auto px-1 pr-1',
            sidebarContentTopAlignClass,
          )}
        >
          {sortedCategories.map((cat) => {
            const locked = Boolean(cat.isLocked);
            return (
              <div key={cat.id} className="group/category w-full">
                <MonthlyExpensesCategoryCard label={cat.label} spent={cat.spent} budget={cat.budget} />

                <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-200 ease-out group-hover/category:grid-rows-[1fr] group-focus-within/category:grid-rows-[1fr]">
                  <div className="min-h-0 overflow-hidden">
                    <div className="mt-1 flex w-full gap-1">
                      <button
                        type="button"
                        aria-label={`Edit ${cat.label}`}
                        disabled={saving}
                        className={cn(
                          'inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-[5px] bg-layer2-half transition hover:bg-layer2 disabled:cursor-not-allowed disabled:opacity-50',
                          typeClass.micro,
                          typeToneClass.muted60,
                        )}
                        onClick={() => openEdit(cat)}
                      >
                        <MdEdit className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        Edit
                      </button>
                      {locked ? null : (
                        <div className="flex min-w-0 flex-1">
                          <MonthlyExpensesCategoryOptionsMenu
                            compact
                            fullWidth
                            triggerLabel="Options"
                            categoryName={cat.label}
                            disabled={saving}
                            onRename={(name) => handleRename(cat.id, name)}
                            onDelete={() => handleDelete(cat.id)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Button
          type="button"
          variant="primary"
          size="md"
          disabled={saving}
          className={sidebarDayListFooterReserveClass}
          onClick={openCreate}
        >
          New category
        </Button>
      </Card>

      <MonthlyExpensesCategoryDialog
        open={dialogOpen}
        mode={dialogMode}
        initial={dialogInitial}
        saving={saving}
        onClose={closeDialog}
        onSubmit={handleCreateOrUpdate}
      />
    </>
  );
}
