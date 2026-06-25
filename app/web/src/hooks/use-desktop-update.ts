'use client';

import { useCallback, useEffect, useState } from 'react';
import type { DesktopUpdateState } from '@/types/desktop-bridge';

function getUpdatesBridge() {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.desktop?.updates ?? null;
}

export function useDesktopUpdate() {
  const [state, setState] = useState<DesktopUpdateState | null>(null);
  const [updateLocked, setUpdateLocked] = useState(false);

  useEffect(() => {
    const updates = getUpdatesBridge();
    if (!updates) {
      return;
    }

    let active = true;

    void updates.getStatus().then((initial) => {
      if (active) {
        setState(initial);
        if (initial.status === 'downloading' || initial.status === 'ready') {
          setUpdateLocked(true);
        }
      }
    });

    const unsubscribe = updates.subscribe((next) => {
      if (!active) {
        return;
      }
      setState(next);
      if (next.status === 'downloading' || next.status === 'ready') {
        setUpdateLocked(true);
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
    setUpdateLocked(true);
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
    setUpdateLocked(true);
    const next = await updates.check();
    setState(next);
    if (next.status === 'available') {
      const downloaded = await updates.download();
      setState(downloaded);
    }
  }, []);

  const isDesktop = Boolean(getUpdatesBridge());

  const cardVisible =
    isDesktop &&
    state &&
    !state.disabled &&
    !updateLocked &&
    state.status === 'available';

  const overlayVisible =
    isDesktop && state && !state.disabled && updateLocked;

  return {
    state,
    cardVisible,
    overlayVisible,
    download,
    install,
    retry,
  };
}
