'use client';

import { useCallback, useEffect, useState } from 'react';
import type { DesktopUpdateState } from '@/types/desktop-bridge';

const DISMISS_STORAGE_KEY = 'new-era:desktop-update-dismissed-version';

function getUpdatesBridge() {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.desktop?.updates ?? null;
}

function isDismissed(nextVersion: string | null) {
  if (!nextVersion || typeof window === 'undefined') {
    return false;
  }
  return sessionStorage.getItem(DISMISS_STORAGE_KEY) === nextVersion;
}

export function useDesktopUpdate() {
  const [state, setState] = useState<DesktopUpdateState | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const updates = getUpdatesBridge();
    if (!updates) {
      return;
    }

    let active = true;

    void updates.getStatus().then((initial) => {
      if (active) {
        setState(initial);
        setDismissed(isDismissed(initial.nextVersion));
      }
    });

    const unsubscribe = updates.subscribe((next) => {
      if (!active) {
        return;
      }
      setState(next);
      if (next.nextVersion && isDismissed(next.nextVersion)) {
        setDismissed(true);
      } else if (next.status !== 'available') {
        setDismissed(false);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const download = useCallback(async () => {
    const updates = getUpdatesBridge();
    if (!updates) {
      return;
    }
    const next = await updates.download();
    setState(next);
  }, []);

  const install = useCallback(async () => {
    const updates = getUpdatesBridge();
    if (!updates) {
      return;
    }
    await updates.install();
  }, []);

  const retry = useCallback(async () => {
    const updates = getUpdatesBridge();
    if (!updates) {
      return;
    }
    const next = await updates.check();
    setState(next);
  }, []);

  const dismiss = useCallback(() => {
    if (!state?.nextVersion) {
      return;
    }
    sessionStorage.setItem(DISMISS_STORAGE_KEY, state.nextVersion);
    setDismissed(true);
  }, [state?.nextVersion]);

  const isDesktop = Boolean(getUpdatesBridge());
  const visible =
    isDesktop &&
    state &&
    !state.disabled &&
    !dismissed &&
    (state.status === 'available' ||
      state.status === 'downloading' ||
      state.status === 'ready' ||
      state.status === 'error');

  return {
    state,
    visible,
    download,
    install,
    retry,
    dismiss,
  };
}
