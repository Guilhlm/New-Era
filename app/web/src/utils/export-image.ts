export const TRAINING_EXPORT_COLORS = {
  background: '#000000',
  layer1: '#0f0f0f',
  layer2: '#242424',
  layer2Half: 'rgba(36, 36, 36, 0.55)',
  text: '#d3d2d1',
  textMuted: 'rgba(211, 210, 209, 0.7)',
  accent: '#8b0838',
} as const;

export function dataUrlToFile(dataUrl: string, filename: string) {
  const [header, base64] = dataUrl.split(',');
  const mimeMatch = header?.match(/:(.*?);/);
  const mime = mimeMatch?.[1] ?? 'image/png';
  const binary = atob(base64 ?? '');
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new File([bytes], filename, { type: mime });
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

export async function shareImageFile(file: File, title: string) {
  if (typeof navigator.share !== 'function') {
    return false;
  }

  const payload = { files: [file], title };
  if (typeof navigator.canShare === 'function' && !navigator.canShare(payload)) {
    return false;
  }

  await navigator.share(payload);
  return true;
}

export function slugifyExportFilename(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function buildTrainingExportFilename(weekdayLabel: string, planTitle: string) {
  const weekday = slugifyExportFilename(weekdayLabel) || 'day';
  const plan = slugifyExportFilename(planTitle) || 'workout';
  return `training-${weekday}-${plan}.png`;
}

type ExportNodeSnapshot = {
  position: string;
  left: string;
  top: string;
  zIndex: string;
  opacity: string;
  pointerEvents: string;
  visibility: string;
};

export function mountExportNodeForCapture(node: HTMLElement): () => void {
  const snapshot: ExportNodeSnapshot = {
    position: node.style.position,
    left: node.style.left,
    top: node.style.top,
    zIndex: node.style.zIndex,
    opacity: node.style.opacity,
    pointerEvents: node.style.pointerEvents,
    visibility: node.style.visibility,
  };

  Object.assign(node.style, {
    position: 'fixed',
    left: '0px',
    top: '0px',
    zIndex: '2147483647',
    opacity: '1',
    pointerEvents: 'none',
    visibility: 'visible',
  });

  return () => {
    node.style.position = snapshot.position;
    node.style.left = snapshot.left;
    node.style.top = snapshot.top;
    node.style.zIndex = snapshot.zIndex;
    node.style.opacity = snapshot.opacity;
    node.style.pointerEvents = snapshot.pointerEvents;
    node.style.visibility = snapshot.visibility;
  };
}
