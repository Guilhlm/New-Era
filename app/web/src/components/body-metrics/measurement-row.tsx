'use client';

import type { MeasurementRowVm } from '@/types/body-metrics';
import { MeasurementInput } from '@/components/body-metrics/measurement-input';

const ROW_GRID_COLUMNS = '8rem minmax(0, 1fr) minmax(0, min(18.7rem, 100%))';

type MeasurementRowProps = {
  row: MeasurementRowVm;
  disabled: boolean;
  inputBaseClass: string;
  savedFieldTextClass: string;
  onChange: (field: string, value: string) => void;
};

export function MeasurementRow({
  row,
  disabled,
  inputBaseClass,
  savedFieldTextClass,
  onChange,
}: MeasurementRowProps) {
  return (
    <div
      className="grid min-h-[4.25rem] w-full items-center gap-x-0 py-8"
      style={{ gridTemplateColumns: ROW_GRID_COLUMNS }}
    >
      <div className="flex min-h-0 min-w-0 w-full items-center gap-2.5 overflow-hidden pr-[30px]">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-red" aria-hidden />
        <span className="truncate text-base text-[color:var(--color-text-60)]">{row.label}</span>
      </div>

      <div className="flex min-h-9 min-w-0 items-center">
        <div className="h-3 w-full rounded-sm bg-layer2">
          <div className="h-3 rounded-sm bg-red" style={{ width: `${row.percent}%` }} aria-hidden />
        </div>
      </div>

      <div className="flex w-full min-w-0 items-stretch gap-[5px] pl-[20px]">
        {row.layout === 'single' && row.single ? (
          <MeasurementInput
            field={row.single.field}
            value={row.single.value}
            toneClass={row.single.toneClass}
            side="single"
            ariaLabel={`${row.label} em cm`}
            placeholder="cm"
            disabled={disabled}
            inputBaseClass={inputBaseClass}
            savedFieldTextClass={savedFieldTextClass}
            onChange={onChange}
          />
        ) : row.bilateral ? (
          <>
            <MeasurementInput
              field={row.bilateral.left.field}
              value={row.bilateral.left.value}
              toneClass={row.bilateral.left.toneClass}
              side="left"
              ariaLabel={row.bilateral.left.ariaLabel}
              placeholder="Left"
              disabled={disabled}
              inputBaseClass={inputBaseClass}
              savedFieldTextClass={savedFieldTextClass}
              onChange={onChange}
            />
            <MeasurementInput
              field={row.bilateral.right.field}
              value={row.bilateral.right.value}
              toneClass={row.bilateral.right.toneClass}
              side="right"
              ariaLabel={row.bilateral.right.ariaLabel}
              placeholder="Right"
              disabled={disabled}
              inputBaseClass={inputBaseClass}
              savedFieldTextClass={savedFieldTextClass}
              onChange={onChange}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}
