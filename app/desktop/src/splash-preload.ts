import { contextBridge, ipcRenderer } from 'electron';
import type { LoadingStep } from './splash';

type LoadingErrorPayload = {
  message: string;
  hint?: string;
};

contextBridge.exposeInMainWorld('splashBridge', {
  onStep: (callback: (step: LoadingStep) => void) => {
    ipcRenderer.on('loading:step', (_event, step: LoadingStep) => {
      callback(step);
    });
  },
  onError: (callback: (payload: LoadingErrorPayload) => void) => {
    ipcRenderer.on('loading:error', (_event, payload: LoadingErrorPayload) => {
      callback(payload);
    });
  },
});
