import { useCallback, useEffect, useState } from 'react';

/** Input de gramas com texto local — permite apagar tudo e digitar sem resetar a cada tecla. */
export function useGramsInput(committedGrams: number, resetKey: string) {
  const [text, setText] = useState(() => String(committedGrams));

  useEffect(() => {
    setText(committedGrams > 0 ? String(committedGrams) : '');
  }, [resetKey]);

  const setFromInput = useCallback((value: string) => {
    if (!/^\d*$/.test(value)) return;
    setText(value);
  }, []);

  const parsed = text === '' ? null : Number(text);

  const resolveGrams = useCallback((): number | null => {
    if (text === '' || parsed === null || !Number.isFinite(parsed) || parsed <= 0) return null;
    return parsed;
  }, [parsed, text]);

  return { text, setFromInput, parsed, resolveGrams };
}
