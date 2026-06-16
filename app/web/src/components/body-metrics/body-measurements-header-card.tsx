'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/cn';
import { typeClass, typeToneClass } from '@/lib/typography';
import Image from 'next/image';
import { MdCheck, MdEdit } from 'react-icons/md';

type BodyMeasurementsHeaderCardProps = {
  data: {
    title: string;
    dateLabel: string;
    weightLabel: string;
    heightLabel: string;
    editing: boolean;
    dirty: {
      weight: boolean;
      height: boolean;
    };
    drafts: {
      weight: string;
      height: string;
    };
  };
  actions: {
    onToggleEdit: () => void;
    onChangeWeight: (value: string) => void;
    onChangeHeight: (value: string) => void;
  };
  style?: React.CSSProperties;
  className?: string;
};

export function BodyMeasurementsHeaderCard({
  data,
  actions,
  style,
  className,
}: BodyMeasurementsHeaderCardProps) {
  return (
    <Card
      className={cn(
        'relative flex h-full min-h-0 flex-col overflow-hidden px-5 py-4 lg:px-6 lg:py-3',
        className,
      )}
      style={style}
    >
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[56%] select-none">
        <Image
          src="/image 4.png"
          alt=""
          fill
          priority
          className="object-cover object-right opacity-75"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-layer1 via-layer1/70 to-transparent" />
      </div>

      <div className="relative flex h-full min-h-0 flex-col pl-2.5 pr-[clamp(12rem,40vw,25rem)] pb-[clamp(1rem,3vh,1.875rem)]">
        <div className="flex items-start gap-3 pt-[clamp(1rem,3vh,1.875rem)]">
          <p className={cn('truncate', typeClass.title, typeToneClass.accent)}>{data.title}</p>

          <button
            type="button"
            className={cn(
              'ml-auto inline-flex h-9 w-9 items-center justify-center rounded-full bg-layer2-half focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red/60',
              data.editing
                ? data.dirty.weight || data.dirty.height
                  ? 'text-red'
                  : 'text-text/70'
                : 'text-text/70',
            )}
            aria-label="Editar medições"
            onClick={actions.onToggleEdit}
          >
            {data.editing ? (
              <MdCheck className="h-5 w-5" aria-hidden />
            ) : (
              <MdEdit className="h-5 w-5" aria-hidden />
            )}
          </button>
        </div>

        <div className="mt-auto grid grid-cols-3 gap-2.5 pt-4">
          <div className="rounded-[5px] bg-layer2-half px-4 py-3">
            <div className="flex justify-center">
              <p className={cn('inline-flex min-w-0 items-center gap-1.5 text-center', typeClass.body)}>
                <span className="shrink-0 text-[color:var(--color-text-60)]">Date:</span>
                <span className="w-[10ch] truncate text-center text-[color:var(--color-text-60)]">
                  {data.dateLabel}
                </span>
              </p>
            </div>
          </div>
          <div className="rounded-[5px] bg-layer2-half px-4 py-3">
            <div className="flex justify-center">
              <div className={cn('inline-flex min-w-0 items-center gap-1.5 text-center', typeClass.body)}>
                <span className="shrink-0 text-[color:var(--color-text-60)]">Weight:</span>
                {data.editing ? (
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="\\d{0,3}(\\.\\d{0,2})?"
                    maxLength={6}
                    className={cn(
                      'w-[10ch] bg-transparent text-center outline-none',
                      typeClass.body,
                      data.dirty.weight ? 'text-red' : 'text-[color:var(--color-text-60)]',
                    )}
                    value={data.drafts.weight}
                    onChange={(e) => actions.onChangeWeight(e.target.value)}
                  />
                ) : (
                  <span className="w-[10ch] truncate text-center text-[color:var(--color-text-60)]">
                    {data.weightLabel}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="rounded-[5px] bg-layer2-half px-4 py-3">
            <div className="flex justify-center">
              <div className={cn('inline-flex min-w-0 items-center gap-1.5 text-center', typeClass.body)}>
                <span className="shrink-0 text-[color:var(--color-text-60)]">Height:</span>
                {data.editing ? (
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="\\d{0,3}"
                    maxLength={3}
                    className={cn(
                      'w-[10ch] bg-transparent text-center outline-none',
                      typeClass.body,
                      data.dirty.height ? 'text-red' : 'text-[color:var(--color-text-60)]',
                    )}
                    value={data.drafts.height}
                    onChange={(e) => actions.onChangeHeight(e.target.value)}
                  />
                ) : (
                  <span className="w-[10ch] truncate text-center text-[color:var(--color-text-60)]">
                    {data.heightLabel}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}