'use client';

import { useCallback, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { toastAuthError } from '@/lib/app-toast';
import type { TrainingMuscleGroupVm } from '@/types/training';
import {
  buildTrainingExportFilename,
  dataUrlToFile,
  downloadDataUrl,
  mountExportNodeForCapture,
  shareImageFile,
  TRAINING_EXPORT_COLORS,
} from '@/utils/export-image';

type UseTrainingExportParams = {
  weekdayLabel: string;
  planTitle: string;
  groups: TrainingMuscleGroupVm[];
  isActive: boolean;
  loading?: boolean;
};

function waitForPaint() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.setTimeout(resolve, 250);
      });
    });
  });
}

export function useTrainingExport({
  weekdayLabel,
  planTitle,
  groups,
  isActive,
  loading = false,
}: UseTrainingExportParams) {
  const exportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const exportTrainingDay = useCallback(async () => {
    if (loading) return;

    if (!isActive || groups.length === 0) {
      toastAuthError('Add muscle groups to export this workout day.');
      return;
    }

    const node = exportRef.current;
    if (!node) {
      toastAuthError('Could not prepare export preview.');
      return;
    }

    setExporting(true);
    const restoreNode = mountExportNodeForCapture(node);

    try {
      await waitForPaint();

      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: TRAINING_EXPORT_COLORS.background,
      });

      const filename = buildTrainingExportFilename(weekdayLabel, planTitle);
      const file = dataUrlToFile(dataUrl, filename);
      const shareTitle = `${weekdayLabel} · ${planTitle}`;

      const shared = await shareImageFile(file, shareTitle).catch(() => false);
      if (!shared) {
        downloadDataUrl(dataUrl, filename);
      }
    } catch {
      toastAuthError('Could not export workout image.');
    } finally {
      restoreNode();
      setExporting(false);
    }
  }, [groups.length, isActive, loading, planTitle, weekdayLabel]);

  const exportDisabled = loading || exporting || !isActive || groups.length === 0;

  return {
    exportRef,
    exporting,
    exportDisabled,
    exportTrainingDay,
  };
}
