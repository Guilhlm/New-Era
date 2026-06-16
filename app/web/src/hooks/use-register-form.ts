'use client';

import { useState } from 'react';
import { toastAuthError, toastUpdated } from '@/lib/app-toast';
import { formatCpfInput } from '@/components/auth/auth-form-shared';
import { usePasswordToggle } from '@/hooks/use-password-toggle';
import { register } from '@/services/auth';
import { CRUD_TOAST } from '@/utils/crud-toast-messages';

type UseRegisterFormParams = {
  onSuccess: () => void;
};

export function useRegisterForm({ onSuccess }: UseRegisterFormParams) {
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const passToggle = usePasswordToggle(false);
  const confirmToggle = usePasswordToggle(false);

  function setCpfValue(value: string) {
    setCpf(formatCpfInput(value));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      toastAuthError('Passwords do not match.');
      return;
    }
    const cpfDigits = cpf.replace(/\D/g, '');
    if (cpfDigits.length !== 11) {
      toastAuthError('Enter a valid CPF (11 digits).');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: `User ${cpfDigits}`,
        email: `${cpfDigits}@cpf.local`,
        password,
        cpf: cpfDigits,
      });
      toastUpdated(CRUD_TOAST.accountCreated);
      onSuccess();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not create account.';
      toastAuthError(message);
      setLoading(false);
    }
  }

  return {
    data: {
      cpf,
      password,
      confirmPassword,
      loading,
      cpfViewValue: formatCpfInput(cpf),
    },
    passwordToggles: {
      passToggle,
      confirmToggle,
    },
    actions: {
      setCpfValue,
      setPassword,
      setConfirmPassword,
      submit,
    },
  };
}
