type ClassPrimitive = string | number | null | undefined | false;
type ClassDictionary = Record<string, boolean | null | undefined>;
type ClassValue = ClassPrimitive | ClassDictionary | ClassValue[];

function flatten(value: ClassValue, output: string[]) {
  if (!value) return;
  if (typeof value === 'string' || typeof value === 'number') {
    output.push(String(value));
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => flatten(item, output));
    return;
  }
  Object.entries(value).forEach(([key, enabled]) => {
    if (enabled) output.push(key);
  });
}

/**
 * Lightweight clsx-like helper used across UI components.
 */
export function cn(...values: ClassValue[]) {
  const output: string[] = [];
  values.forEach((value) => flatten(value, output));
  return output.join(' ');
}
