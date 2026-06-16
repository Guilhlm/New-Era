import { useSyncExternalStore } from 'react';

/** Avoid SSR/client mismatches for query loading and locale-dependent UI. */
export function useIsClientMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
