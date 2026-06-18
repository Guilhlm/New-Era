'use client';

import { useState } from 'react';
import { toastAuthError, toastUpdated } from '@/lib/app-toast';
import { formatCpfInput } from '@/components/auth/auth-form-shared';
import { usePasswordToggle } from '@/hooks/use-password-toggle';
import { requestPasswordReset, resetPassword } from '@/services/auth';
import { CRUD_TOAST } from '@/utils/crud-toast-messages';

const MIN_PASSWORD_LEN = 8;
const MIN_TOKEN_LEN = 16;

type ResetStep = 'request' | 'confirm';

export function useResetPasswordForm() {
  const [step, setStep] = useState<ResetStep>('request');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const passwordToggle = usePasswordToggle(false);

  function setCpfValue(value: string) {
    setCpf(formatCpfInput(value));
  }

  async function submitRequest(e: React.FormEvent) {
    e.preventDefault();
    const emailNormalized = email.trim().toLowerCase();
    if (!emailNormalized.includes('@')) {
      toastAuthError('Enter a valid email.');
      return;
    }

    const cpfDigits = cpf.replace(/\D/g, '');
    if (cpfDigits.length !== 11) {
      toastAuthError('Enter a valid CPF (11 digits).');
      return;
    }

    setLoading(true);
    try {
      await requestPasswordReset({ email: emailNormalized, cpf: cpfDigits });
      toastUpdated(CRUD_TOAST.passwordResetRequested);
      setStep('confirm');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Could not request password reset.';
      toastAuthError(message);
    } finally {
      setLoading(false);
    }
  }

  async function submitConfirm(e: React.FormEvent) {
    e.preventDefault();
    const cleanToken = token.trim();
    if (cleanToken.length < MIN_TOKEN_LEN) {
      toastAuthError('Enter the reset code you received.');
      return;
    }

    if (newPassword.trim().length < MIN_PASSWORD_LEN) {
      toastAuthError(`Password must be at least ${MIN_PASSWORD_LEN} characters.`);
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ token: cleanToken, newPassword });
      toastUpdated(CRUD_TOAST.passwordUpdated);
      setToken('');
      setNewPassword('');
      setStep('request');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not reset password.';
      toastAuthError(message);
    } finally {
      setLoading(false);
    }
  }

  return {
    data: {
      step,
      email,
      cpf,
      token,
      newPassword,
      loading,
      cpfViewValue: formatCpfInput(cpf),
    },
    passwordToggle,
    actions: {
      setEmail,
      setCpfValue,
      setToken,
      setNewPassword,
      backToRequest: () => setStep('request'),
      submitRequest,
      submitConfirm,
    },
  };
}
