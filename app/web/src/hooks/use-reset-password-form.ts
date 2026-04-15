'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { toastAuthError } from '@/components/auth/auth-error-toast';
import { formatCpfInput } from '@/components/auth/auth-form-shared';
import { usePasswordToggle } from '@/hooks/use-password-toggle';
import { resetPassword } from '@/services/auth';

const MIN_PASSWORD_LEN = 6;

export function useResetPasswordForm() {
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const passwordToggle = usePasswordToggle(false);

  function setCpfValue(value: string) {
    setCpf(formatCpfInput(value));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const emailNormalized = email.trim().toLowerCase();
    if (!emailNormalized) {
      toastAuthError('Enter your email.');
      return;
    }
    if (!emailNormalized.includes('@')) {
      toastAuthError('Enter a valid email.');
      return;
    }

    const cpfDigits = cpf.replace(/\D/g, '');
    if (cpfDigits.length !== 11) {
      toastAuthError('Enter a valid CPF (11 digits).');
      return;
    }

    if (newPassword.trim().length < MIN_PASSWORD_LEN) {
      toastAuthError(`Password must be at least ${MIN_PASSWORD_LEN} characters.`);
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ email: emailNormalized, cpf: cpfDigits, newPassword });
      toast.success('Password updated. You can sign in with your new password.', {
        duration: 6000,
      });
      setNewPassword('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not reset password.';
      toastAuthError(message);
    } finally {
      setLoading(false);
    }
  }

  return {
    data: {
      email,
      cpf,
      newPassword,
      loading,
      cpfViewValue: formatCpfInput(cpf),
    },
    passwordToggle,
    actions: {
      setEmail,
      setCpfValue,
      setNewPassword,
      submit,
    },
  };
}
