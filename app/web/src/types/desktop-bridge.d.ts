export type DesktopUpdateStatus =
  | 'idle'
  | 'checking'
  | 'available'
  | 'downloading'
  | 'ready'
  | 'error'
  | 'uptodate';

export type DesktopUpdateState = {
  disabled: boolean;
  status: DesktopUpdateStatus;
  currentVersion: string;
  nextVersion: string | null;
  progress: number | null;
  errorMessage: string | null;
};

export type DesktopUpdatesBridge = {
  getStatus: () => Promise<DesktopUpdateState>;
  check: () => Promise<DesktopUpdateState>;
  download: () => Promise<DesktopUpdateState>;
  install: () => Promise<DesktopUpdateState>;
  subscribe: (listener: (state: DesktopUpdateState) => void) => () => void;
};

export type DesktopBridge = {
  navigate: (href: string) => void;
  getVersion: () => Promise<string>;
  updates: DesktopUpdatesBridge;
};

declare global {
  interface Window {
    desktop?: DesktopBridge;
  }
}

export {};
