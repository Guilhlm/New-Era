'use client';

import { DietDailyMacrosCard } from '@/components/diet/diet-daily-macros-card';
import { DietIngredientEditSheet } from '@/components/diet/diet-ingredient-edit-sheet';
import { DietMealsGrid } from '@/components/diet/diet-meals-grid';
import { DietPlanHeaderCard } from '@/components/diet/diet-plan-header-card';
import { DietWaterIntakeCard } from '@/components/diet/diet-water-intake-card';
import { DietWeeklyNutritionChart } from '@/components/diet/diet-weekly-nutrition-chart';
import {
  DashboardTwoColumnLayout,
  dashboardGridArea,
} from '@/components/ui/dashboard-two-column-layout';
import { useDietDashboardState } from '@/hooks/use-diet-dashboard-state';
import { useWaterIntake } from '@/hooks/use-water-intake';

export function DietDashboard() {
  const state = useDietDashboardState();
  const water = useWaterIntake(state.data.selectedWeekday);

  return (
    <>
      <DashboardTwoColumnLayout>
        <DietPlanHeaderCard
          data={state.data.header}
          actions={{
            onPrevDay: state.actions.prevDay,
            onNextDay: state.actions.nextDay,
          }}
          className="h-full min-h-0"
          style={dashboardGridArea('main', 'header')}
        />

        <DietMealsGrid
          data={{ meals: state.data.meals }}
          actions={{
            onCreateMeal: state.actions.openCreateMeal,
            onConfirmCreateMeal: state.actions.createMeal,
            onCloseCreateMeal: state.actions.closeCreateMeal,
            onRenameMeal: state.actions.renameMeal,
            onDeleteMeal: state.actions.removeMeal,
            onToggleMealExpanded: state.actions.toggleMealExpanded,
            onStartIngredientDraft: state.actions.startIngredientDraft,
            onSelectDraftFood: state.actions.selectDraftFood,
            onChangeDraftGrams: state.actions.changeDraftGrams,
            onConfirmDraft: state.actions.confirmDraft,
            onCancelDraft: state.actions.cancelDraft,
            onEditItem: state.actions.openEditItemByIds,
          }}
          ui={{
            loading: state.ui.loading,
            saving: state.ui.saving,
            createMealOpen: state.ui.createMealOpen,
          }}
          className="min-h-0 overflow-hidden"
          style={dashboardGridArea('main', 'body')}
        />

        <div
          className="flex h-full min-h-0 w-full min-w-0 flex-col gap-2.5 overflow-hidden"
          style={{ ...dashboardGridArea('sidebar', 'header'), gridRow: '1 / 3' }}
        >
          <DietDailyMacrosCard
            data={{
              title: 'Daily Macros',
              totalKcalLabel: state.data.dailyMacros.totalKcalLabel,
              segments: state.data.dailyMacros.segments,
              legend: state.data.dailyMacros.legend,
            }}
            className="min-h-0 flex-[2]"
          />
          <DietWaterIntakeCard
            data={water.data}
            actions={{
              onGlassClick: water.actions.clickGlass,
              onStartEdit: water.actions.startEdit,
              onSaveEdit: water.actions.saveEdit,
              onCancelEdit: water.actions.cancelEdit,
              onWaterTotalChange: water.actions.changeWaterTotal,
            }}
            ui={water.ui}
            className="min-h-0 flex-1"
          />
          <DietWeeklyNutritionChart
            data={{
              title: 'Weekly Nutrition Chart',
              bars: state.data.weeklyChart.bars,
            }}
            className="min-h-0 flex-1"
          />
        </div>
      </DashboardTwoColumnLayout>

      <DietIngredientEditSheet
        open={Boolean(state.data.editItem)}
        item={state.data.editItem?.item ?? null}
        saving={state.ui.saving}
        onClose={state.actions.closeEditItem}
        onSave={state.actions.saveEditItem}
        onDelete={state.actions.deleteEditItem}
      />
    </>
  );
}
