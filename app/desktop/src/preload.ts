import { contextBridge, ipcRenderer } from 'electron';
import type { UpdateState } from './auto-updater';

const UPDATE_STATUS_CHANNEL = 'desktop:update:status-changed';

contextBridge.exposeInMainWorld('desktop', {
  navigate: (href: string) => ipcRenderer.send('desktop:navigate', href),
  getVersion: () => ipcRenderer.invoke('desktop:getVersion') as Promise<string>,
  updates: {
    getStatus: () => ipcRenderer.invoke('desktop:update:getStatus') as Promise<UpdateState>,
    check: () => ipcRenderer.invoke('desktop:update:check') as Promise<UpdateState>,
    download: () => ipcRenderer.invoke('desktop:update:download') as Promise<UpdateState>,
    install: () => ipcRenderer.invoke('desktop:update:install') as Promise<UpdateState>,
    subscribe: (listener: (state: UpdateState) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, state: UpdateState) => {
        listener(state);
      };
      ipcRenderer.on(UPDATE_STATUS_CHANNEL, handler);
      return () => {
        ipcRenderer.removeListener(UPDATE_STATUS_CHANNEL, handler);
      };
    },
  },
});
