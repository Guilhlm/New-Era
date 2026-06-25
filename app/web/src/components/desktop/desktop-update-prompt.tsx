'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/cn';
import { DesktopUpdateOverlay } from '@/components/desktop/desktop-update-overlay';
import { useDesktopUpdate } from '@/hooks/use-desktop-update';
import { typeClass } from '@/lib/typography';

export function DesktopUpdatePrompt() {
  const { state, cardVisible, overlayVisible, download, install, retry } =
    useDesktopUpdate();

  if (!state || state.disabled) {
    return null;
  }

  return (
    <>
      {cardVisible ? (
        <aside
          className={cn(
            'fixed bottom-4 right-4 z-[1100] w-[min(100vw-2rem,20rem)] rounded-xl border border-grey bg-layer1 p-5 shadow-lg',
          )}
          aria-live="polite"
          aria-label="App update available"
        >
          <p className={cn(typeClass.bodyStrong, 'text-text')}>
            New Version {state.nextVersion} Already!
          </p>
          <p className={cn(typeClass.caption, 'mt-1 text-text/55')}>
            Current version {state.currentVersion}
          </p>
          <Button
            size="md"
            className="mt-4 w-full"
            onClick={() => void download()}
          >
            Update right now!
          </Button>
        </aside>
      ) : null}

      {overlayVisible ? (
        <DesktopUpdateOverlay
          state={state}
          onInstall={() => void install()}
          onRetry={() => void retry()}
        />
      ) : null}
    </>
  );
}
