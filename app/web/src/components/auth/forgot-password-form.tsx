'use client';

import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { toastAuthError } from '@/components/auth/auth-error-toast';

import { AuthField } from '@/components/auth/auth-field';
import {
  authFieldsStackClass,
  authLinkClass,
  authPasswordToggleButtonClass,
  authSubmitButtonClass,
  formatCpfInput,
} from '@/components/auth/auth-form-shared';
import {
  AUTH_GRID_FORM_CLASS,
  AUTH_GRID_ROW_ACTIONS_CLASS,
  AUTH_GRID_ROW_FIELDS_CLASS,
  AUTH_GRID_ROW_TITLE_CLASS,
  authTitleClassName,
} from '@/components/auth/auth-shell';
import { IconEye, IconEyeOff, IconKey, IconUser } from '@/components/auth/icons';
import { Button } from '@/components/ui/button';
import { usePasswordToggle } from '@/hooks/use-password-toggle';

const MIN_PASSWORD_LEN = 6;

type ForgotPasswordFormProps = {
  title: string;
};

export function ForgotPasswordForm({ title }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const passToggle = usePasswordToggle(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const emailTrim = email.trim().toLowerCase();
    if (!emailTrim) {
      toastAuthError('Enter your email.');
      return;
    }
    if (!emailTrim.includes('@')) {
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
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailTrim,
          cpf: cpfDigits,
          newPassword,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toastAuthError(data.error || 'Could not reset password.');
        return;
      }
      toast.success('Password updated. You can sign in with your new password.', {
        duration: 6000,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className={AUTH_GRID_FORM_CLASS}>
      <div className={AUTH_GRID_ROW_TITLE_CLASS}>
        <h1 className={authTitleClassName(title)}>{title}</h1>
      </div>

      <div className={AUTH_GRID_ROW_FIELDS_CLASS}>
        <div className={authFieldsStackClass}>
          <p className="m-0 text-center text-sm leading-relaxed text-red sm:text-base">
            Enter the email and CPF registered on the same account. If they match, your new password
            will be saved and you can sign in with it.
          </p>
          <AuthField
            icon={<IconUser />}
            type="email"
            autoComplete="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <AuthField
            icon={<IconUser />}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="CPF 000.000.000-00"
            value={formatCpfInput(cpf)}
            onChange={(e) => setCpf(formatCpfInput(e.target.value))}
          />
          <AuthField
            icon={<IconKey />}
            type={passToggle.inputType}
            autoComplete="new-password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            right={
              <button
                type="button"
                className={authPasswordToggleButtonClass}
                onClick={passToggle.toggle}
                aria-label={passToggle.visible ? 'Hide password' : 'Show password'}
              >
                {passToggle.visible ? <IconEyeOff /> : <IconEye />}
              </button>
            }
          />
        </div>
      </div>

      <div className={AUTH_GRID_ROW_ACTIONS_CLASS}>
        <Link href="/login" className={`${authLinkClass} text-center text-sm font-bold text-text`}>
          Back to login
        </Link>
        <Button
          type="submit"
          size="lg"
          radius="md"
          disabled={loading}
          className={authSubmitButtonClass}
        >
          {loading ? 'Resetting…' : 'Reset password'}
        </Button>
      </div>
    </form>
  );
}
