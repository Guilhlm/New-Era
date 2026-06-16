import { cn } from '@/components/ui/cn';
import { typeClass, typeToneClass } from '@/lib/typography';

type DietIngredientMacroStripProps = {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};

function MacroCell({ amount, unit }: { amount: string; unit: string }) {
  return (
    <span className={cn('whitespace-nowrap', typeClass.body)}>
      <span className={cn(typeClass.bodyStrong, typeToneClass.default)}>{amount}</span>
      <span className="text-text/45"> {unit}</span>
    </span>
  );
}

function MacroDivider() {
  return <span className="shrink-0 text-text/20" aria-hidden>|</span>;
}

export function DietIngredientMacroStrip({
  calories,
  protein,
  carbs,
  fats,
}: DietIngredientMacroStripProps) {
  return (
    <div className="hidden shrink-0 items-center gap-3 sm:flex">
      <MacroCell amount={String(calories)} unit="Kcal" />
      <MacroDivider />
      <MacroCell amount={`${protein}g`} unit="Protein" />
      <MacroDivider />
      <MacroCell amount={`${carbs}g`} unit="Carb" />
      <MacroDivider />
      <MacroCell amount={`${fats}g`} unit="Fat" />
    </div>
  );
}
