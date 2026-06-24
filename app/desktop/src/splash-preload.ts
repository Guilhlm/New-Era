import { contextBridge, ipcRenderer } from 'electron';
import type { LoadingStep } from './splash';

type LoadingErrorPayload = {
  message: string;
  hint?: string;
};

const stepListeners = new Set<(step: LoadingStep) => void>();
const errorListeners = new Set<(payload: LoadingErrorPayload) => void>();

let lastStep: LoadingStep | null = null;
let lastError: LoadingErrorPayload | null = null;

ipcRenderer.on('loading:step', (_event, step: LoadingStep) => {
  lastStep = step;
  for (const listener of stepListeners) {
    listener(step);
  }
});

ipcRenderer.on('loading:error', (_event, payload: LoadingErrorPayload) => {
  lastError = payload;
  for (const listener of errorListeners) {
    listener(payload);
  }
});

contextBridge.exposeInMainWorld('splashBridge', {
  onStep: (callback: (step: LoadingStep) => void) => {
    stepListeners.add(callback);
    if (lastStep) {
      callback(lastStep);
    }
  },
  onError: (callback: (payload: LoadingErrorPayload) => void) => {
    errorListeners.add(callback);
    if (lastError) {
      callback(lastError);
    }
  },
});
