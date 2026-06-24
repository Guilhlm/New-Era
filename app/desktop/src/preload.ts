import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('desktop', {
  navigate: (href: string) => ipcRenderer.send('desktop:navigate', href),
});
