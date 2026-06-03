'use client';

import { useMemo, useState } from 'react';
import { PASSWORD_MASK } from '@/utils/profile';

type UsePasswordFieldParams = {
  saving: boolean;
  hasChangesWithoutPassword: boolean;
};

export type PasswordFieldModel = {
  data: {
    newPassword: string;
    showPass: boolean;
    eyeEnabled: boolean;
    inputType: 'text' | 'password';
    readOnly: boolean;
    value: string;
    placeholder: string;
    toneClass: string;
  };
  actions: {
    setNewPassword: (value: string) => void;
    openEditMode: () => void;
    handleBlur: () => void;
    toggleVisibility: () => void;
    resetToMask: () => void;
  };
};

export function usePasswordField({ saving, hasChangesWithoutPassword }: UsePasswordFieldParams): PasswordFieldModel {
  const [showPass, setShowPass] = useState(false);
  const [surfaceMode, setSurfaceMode] = useState<'mask' | 'edit'>('mask');
  const [newPassword, setNewPassword] = useState('');

  const hasChanges = hasChangesWithoutPassword || newPassword.length > 0;
  const eyeEnabled = !saving && hasChanges;
  const isMasked = surfaceMode === 'mask';
  const effectiveShowPass = eyeEnabled ? showPass : false;
  const inputType: 'text' | 'password' = effectiveShowPass ? 'text' : 'password';

  const toneClass = useMemo(() => {
    if (surfaceMode === 'mask') return 'text-grey';
    return newPassword === '' ? 'text-grey' : 'text-red';
  }, [newPassword, surfaceMode]);

  function resetToMask() {
    setShowPass(false);
    setSurfaceMode('mask');
    setNewPassword('');
  }

  function openEditMode() {
    setSurfaceMode('edit');
    setNewPassword('');
  }

  function handleBlur() {
    if (newPassword !== '') return;
    setSurfaceMode('mask');
    setShowPass(false);
  }

  function toggleVisibility() {
    if (!eyeEnabled) return;
    setShowPass((prev) => !prev);
  }

  return {
    data: {
      newPassword,
      showPass,
      eyeEnabled,
      inputType,
      readOnly: isMasked,
      value: isMasked ? PASSWORD_MASK : newPassword,
      placeholder: isMasked ? '' : 'new password (optional)',
      toneClass,
    },
    actions: {
      setNewPassword,
      openEditMode,
      handleBlur,
      toggleVisibility,
      resetToMask,
    },
  };
}
