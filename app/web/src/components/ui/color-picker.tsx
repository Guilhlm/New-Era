'use client';

import type { PointerEvent } from 'react';
import { useMemo, useState } from 'react';
import { cn } from '@/components/ui/cn';
import { typeClass, typeToneClass } from '@/lib/typography';
import { clamp, hexToHsv, hsvToHex, normalizeHex, type HsvColor } from '@/utils/color';

export const DEFAULT_PICKER_COLOR = '#820AD1';

export type ColorPickerProps = {
  value: string;
  onChange: (hex: string) => void;
  disabled?: boolean;
  className?: string;
};

const FOCUS_CLASS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red/60 focus-visible:ring-offset-0';

function updateSaturationBrightness(event: PointerEvent<HTMLDivElement>, hsv: HsvColor) {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = clamp(event.clientX - rect.left, 0, rect.width);
  const y = clamp(event.clientY - rect.top, 0, rect.height);

  return {
    ...hsv,
    s: Math.round((x / rect.width) * 100),
    v: Math.round(100 - (y / rect.height) * 100),
  };
}

function updateHue(event: PointerEvent<HTMLDivElement>, hsv: HsvColor) {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = clamp(event.clientX - rect.left, 0, rect.width);
  return {
    ...hsv,
    h: Math.round((x / rect.width) * 360) % 360,
  };
}

export function ColorPicker({
  value,
  onChange,
  disabled = false,
  className,
}: ColorPickerProps) {
  const [editingHex, setEditingHex] = useState<string | null>(null);
  const normalizedValue = normalizeHex(value) ?? DEFAULT_PICKER_COLOR;
  const draftHsv = useMemo(() => hexToHsv(normalizedValue), [normalizedValue]);
  const draftHex = hsvToHex(draftHsv);
  const hexDraft = editingHex ?? normalizedValue;

  function applyDraft(nextHsv: HsvColor) {
    setEditingHex(null);
    onChange(hsvToHex(nextHsv));
  }

  function applyHexInput(nextValue: string) {
    const normalized = normalizeHex(nextValue);
    if (!normalized) {
      setEditingHex(null);
      return;
    }

    setEditingHex(null);
    onChange(normalized);
  }

  return (
    <div className={cn('flex w-full flex-col gap-3', className)}>
      <div
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label="Saturação e brilho"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={draftHsv.v}
        aria-valuetext={`Saturação ${draftHsv.s}%, brilho ${draftHsv.v}%`}
        className={cn(
          'relative h-36 w-full touch-none overflow-hidden rounded-xl border border-[#1E1E25]',
          FOCUS_CLASS,
          disabled ? 'pointer-events-none opacity-60' : 'cursor-crosshair',
        )}
          style={{
            backgroundColor: `hsl(${draftHsv.h} 100% 50%)`,
            backgroundImage:
              'linear-gradient(90deg, #fff 0%, rgba(255,255,255,0) 100%), linear-gradient(0deg, #000 0%, rgba(0,0,0,0) 100%)',
          }}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            applyDraft(updateSaturationBrightness(event, draftHsv));
          }}
          onPointerMove={(event) => {
            if (event.buttons !== 1) return;
            applyDraft(updateSaturationBrightness(event, draftHsv));
          }}
          onKeyDown={(event) => {
            if (disabled) return;
            const step = event.shiftKey ? 10 : 2;
            const actions: Record<string, HsvColor> = {
              ArrowLeft: { ...draftHsv, s: clamp(draftHsv.s - step, 0, 100) },
              ArrowRight: { ...draftHsv, s: clamp(draftHsv.s + step, 0, 100) },
              ArrowDown: { ...draftHsv, v: clamp(draftHsv.v - step, 0, 100) },
              ArrowUp: { ...draftHsv, v: clamp(draftHsv.v + step, 0, 100) },
            };
            const nextHsv = actions[event.key];
            if (!nextHsv) return;
            event.preventDefault();
            applyDraft(nextHsv);
          }}
        >
          <span
            className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.45),0_8px_20px_rgba(0,0,0,0.35)]"
            style={{ left: `${draftHsv.s}%`, top: `${100 - draftHsv.v}%` }}
          />
      </div>

      <div className="flex w-full flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className={cn(typeClass.micro, typeToneClass.muted60)}>Hue</span>
          <span className={cn('tabular-nums', typeClass.micro, typeToneClass.muted60)}>{draftHsv.h}°</span>
        </div>
        <div
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-label="Matiz"
          aria-valuemin={0}
          aria-valuemax={359}
          aria-valuenow={draftHsv.h}
          className={cn(
            'relative h-6 w-full touch-none rounded-full border border-[#1E1E25] bg-[linear-gradient(90deg,#ff0000_0%,#ffff00_16.66%,#00ff00_33.33%,#00ffff_50%,#0000ff_66.66%,#ff00ff_83.33%,#ff0000_100%)]',
            FOCUS_CLASS,
            disabled ? 'pointer-events-none opacity-60' : 'cursor-pointer',
          )}
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              applyDraft(updateHue(event, draftHsv));
            }}
            onPointerMove={(event) => {
              if (event.buttons !== 1) return;
              applyDraft(updateHue(event, draftHsv));
            }}
            onKeyDown={(event) => {
              if (disabled) return;
              const step = event.shiftKey ? 15 : 3;
              if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
              event.preventDefault();
              applyDraft({
                ...draftHsv,
                h: (draftHsv.h + (event.key === 'ArrowRight' ? step : -step) + 360) % 360,
              });
            }}
          >
            <span
              className="pointer-events-none absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.45),0_8px_20px_rgba(0,0,0,0.35)]"
              style={{ left: `${(draftHsv.h / 360) * 100}%`, backgroundColor: `hsl(${draftHsv.h} 100% 50%)` }}
            />
        </div>
      </div>

      <div className="grid w-full grid-cols-[1fr_auto] gap-2">
        <label className="flex min-w-0 flex-col gap-1.5">
          <span className={cn(typeClass.micro, typeToneClass.muted60)}>HEX</span>
          <input
            type="text"
            inputMode="text"
            disabled={disabled}
            value={hexDraft}
            maxLength={7}
            className={cn(
              'h-10 w-full rounded-xl border border-[#1E1E25] bg-layer2/60 px-3 font-mono text-sm uppercase tracking-wider text-text outline-none placeholder:text-text/40 disabled:opacity-60',
              FOCUS_CLASS,
            )}
            placeholder={DEFAULT_PICKER_COLOR}
            onChange={(event) => {
              const nextValue = event.target.value.toUpperCase().replace(/[^#0-9A-F]/g, '');
              const nextDraft = nextValue.startsWith('#') ? nextValue.slice(0, 7) : `#${nextValue.slice(0, 6)}`;
              setEditingHex(nextDraft);
              const normalized = normalizeHex(nextDraft);
              if (normalized) onChange(normalized);
            }}
            onBlur={(event) => applyHexInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== 'Enter') return;
              event.preventDefault();
              applyHexInput(event.currentTarget.value);
            }}
          />
        </label>
        <div className="flex flex-col gap-1.5">
          <span className={cn(typeClass.micro, typeToneClass.muted60)}>Preview</span>
          <span
            className="h-10 w-12 rounded-xl border border-white/10 shadow-inner"
            style={{ backgroundColor: draftHex }}
            aria-label={`Preview da cor ${draftHex}`}
          />
        </div>
      </div>
    </div>
  );
}
