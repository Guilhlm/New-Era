'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/cn';
import type { DesktopUpdateState } from '@/types/desktop-bridge';
import { typeClass } from '@/lib/typography';

type DesktopUpdateOverlayProps = {
  state: DesktopUpdateState;
  onInstall: () => void;
  onRetry: () => void;
};

export function DesktopUpdateOverlay({
  state,
  onInstall,
  onRetry,
}: DesktopUpdateOverlayProps) {
  const progress = state.progress != null ? Math.round(state.progress) : 0;
  const isError = state.status === 'error';
  const isReady = state.status === 'ready';
  const isDownloading = state.status === 'downloading';
  const isPreparing =
    state.status === 'checking' ||
    state.status === 'idle' ||
    state.status === 'available';

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90"
      role="dialog"
      aria-modal="true"
      aria-busy={!isError && !isReady}
      aria-label="App update in progress"
    >
      <div className="flex w-full max-w-md flex-col items-center px-10 py-8 text-center">
        <h2 className="mb-9 text-[1.75rem] font-bold tracking-tight text-[#f5f5f4]">
          New-Era
        </h2>

        {!isError && !isReady ? (
          <div
            className="mb-7 h-14 w-14 animate-spin rounded-full border-[3px] border-[rgb(139_8_56/0.2)] border-t-[#8b0838]"
            aria-hidden
          />
        ) : null}

        {!isError && !isReady && (isDownloading || isPreparing) ? (
          <div
            className="mb-4 h-[3px] w-full max-w-[280px] overflow-hidden rounded-full bg-[rgb(211_210_209/0.12)]"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#8b0838] to-[#a8325a] transition-[width] duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        ) : null}

        {isDownloading ? (
          <>
            <p className={cn(typeClass.body, 'min-h-5 text-[rgb(211_210_209/0.75)]')}>
              Updating the app…
            </p>
            <p className={cn(typeClass.caption, 'mt-2 text-[rgb(211_210_209/0.4)]')}>
              {progress}% — your local data is preserved.
            </p>
          </>
        ) : null}

        {isPreparing && !isDownloading ? (
          <p className={cn(typeClass.body, 'min-h-5 text-[rgb(211_210_209/0.75)]')}>
            Preparing update…
          </p>
        ) : null}

        {isReady ? (
          <>
            <p className={cn(typeClass.bodyStrong, 'text-[#f5f5f4]')}>Update ready</p>
            <p className={cn(typeClass.caption, 'mt-3 text-[rgb(211_210_209/0.65)]')}>
              Restart now to finish installing version {state.nextVersion}.
            </p>
            <Button size="md" className="mt-6 w-full max-w-[280px]" onClick={onInstall}>
              Restart now
            </Button>
          </>
        ) : null}

        {isError ? (
          <>
            <p className={cn(typeClass.bodyStrong, 'text-[#e85d7a]')}>Could not update</p>
            <p className={cn(typeClass.caption, 'mt-3 max-w-sm text-[rgb(211_210_209/0.65)]')}>
              {state.errorMessage ?? 'Try again in a moment.'}
            </p>
            <Button
              size="md"
              variant="secondary"
              className="mt-6 w-full max-w-[280px]"
              onClick={onRetry}
            >
              Try again
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
}
