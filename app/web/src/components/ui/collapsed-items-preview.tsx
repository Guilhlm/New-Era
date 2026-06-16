'use client';

import { cn } from '@/components/ui/cn';
import { typeClass } from '@/lib/typography';

const SEP = <span className="text-text/35"> · </span>;

type CollapsedItemsPreviewProps = {
  count: number;
  countLabel: string;
  emptyLabel: string;
  previewNames: string[];
  metaSegments?: string[];
  fullTitle?: string;
};

export function CollapsedItemsPreview({
  count,
  countLabel,
  emptyLabel,
  previewNames,
  metaSegments = [],
  fullTitle,
}: CollapsedItemsPreviewProps) {
  if (count === 0) {
    return <span className={cn('truncate', typeClass.caption, 'text-text/45')}>{emptyLabel}</span>;
  }

  const preview = previewNames.slice(0, 2).join(' · ');
  const hiddenCount = Math.max(0, previewNames.length - 2);

  const title =
    fullTitle ??
    [countLabel, ...metaSegments, ...previewNames].filter(Boolean).join(' · ');

  return (
    <span className={cn('truncate', typeClass.caption)} title={title}>
      {countLabel}
      {metaSegments.map((segment) => (
        <span key={segment}>
          {SEP}
          {segment}
        </span>
      ))}
      {preview ? (
        <>
          {SEP}
          <span className="text-text/40">
            {preview}
            {hiddenCount > 0 ? ` · +${hiddenCount}` : ''}
          </span>
        </>
      ) : null}
    </span>
  );
}
