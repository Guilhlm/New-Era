'use client';

import { useState } from 'react';

export function usePasswordToggle(initial = false) {
  const [visible, setVisible] = useState(initial);
  const inputType = visible ? 'text' : 'password';
  const toggle = () => setVisible((prev) => !prev);

  return {
    visible,
    inputType,
    toggle,
  };
}

export type PasswordToggleState = ReturnType<typeof usePasswordToggle>;
