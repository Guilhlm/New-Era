'use client';

import { useState } from 'react';
import { toastAuthError } from '@/lib/app-toast';
import { formatCpfInput } from '@/components/auth/auth-form-shared';
import { usePasswordToggle } from '@/hooks/use-password-toggle';
import { login } from '@/services/auth';

function looksLikeEmail(value: string) {
  return value.includes('@') || /[a-zA-Z]/.test(value);
}

function normalizeIdentifier(value: string) {
  return looksLikeEmail(value) ? value.trim().toLowerCase() : value.replace(/\D/g, '');
}

const AUTH_INPUT_SAVED_CLASS = 'text-input-idle';

function getInputTone(currentValue: string) {
  return normalizeIdentifier(currentValue) === '' ? AUTH_INPUT_SAVED_CLASS : 'text-red';
}

type UseLoginFormParams = {
  onSuccess: () => void;
};

export function useLoginForm({ onSuccess }: UseLoginFormParams) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const passToggle = usePasswordToggle(false);
  const confirmToggle = usePasswordToggle(false);
  const identifierInputMode: 'email' | 'numeric' = looksLikeEmail(identifier) ? 'email' : 'numeric';

  function setIdentifierValue(value: string) {
    if (looksLikeEmail(value)) {
      setIdentifier(value);
      return;
    }
    setIdentifier(formatCpfInput(value));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      toastAuthError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await login({ identifier, password });
      onSuccess();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid credentials.';
      toastAuthError(message);
      setLoading(false);
    }
  }

  return {
    data: {
      identifier,
      password,
      confirmPassword,
      loading,
      identifierInputMode,
      identifierViewValue: looksLikeEmail(identifier) ? identifier : formatCpfInput(identifier),
      tones: {
        identifier: getInputTone(identifier),
        password: getInputTone(password),
        confirmPassword: getInputTone(confirmPassword),
      },
    },
    passwordToggles: {
      passToggle,
      confirmToggle,
    },
    actions: {
      setIdentifierValue,
      setPassword,
      setConfirmPassword,
      submit,
    },
  };
}
