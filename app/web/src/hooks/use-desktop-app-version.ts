'use client';

import { useEffect, useState } from 'react';

export function useDesktopAppVersion() {
  const [version, setVersion] = useState<string | null>(null);

  useEffect(() => {
    const bridge = window.desktop;
    if (!bridge?.getVersion) {
      return;
    }

    void bridge.getVersion().then(setVersion).catch(() => {
      setVersion(null);
    });
  }, []);

  return version;
}
