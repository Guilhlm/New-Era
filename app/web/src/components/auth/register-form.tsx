'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
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

type RegisterFormProps = {
  title: string;
};

export function RegisterForm({ title }: RegisterFormProps) {
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const passToggle = usePasswordToggle(false);
  const confirmToggle = usePasswordToggle(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toastAuthError('Passwords do not match.');
      return;
    }
    const cpfDigits = cpf.replace(/\D/g, '');
    if (cpfDigits.length !== 11) {
      toastAuthError('Enter a valid CPF (11 digits).');
      return;
    }
    const email = `${cpfDigits}@cpf.local`;
    const name = `Usuário ${cpfDigits}`;
    setLoading(true);
    let resetLoading = true;
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          cpf: cpfDigits,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toastAuthError(data.error || 'Could not create account.');
        return;
      }
      resetLoading = false;
      router.push('/');
      router.refresh();
    } finally {
      if (resetLoading) setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className={AUTH_GRID_FORM_CLASS}>
      <div className={AUTH_GRID_ROW_TITLE_CLASS}>
        <h1 className={authTitleClassName(title)}>{title}</h1>
      </div>

      <div className={AUTH_GRID_ROW_FIELDS_CLASS}>
        <div className={authFieldsStackClass}>
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
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          <AuthField
            icon={<IconKey />}
            type={confirmToggle.inputType}
            autoComplete="new-password"
            placeholder="Confirm Password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            right={
              <button
                type="button"
                className={authPasswordToggleButtonClass}
                onClick={confirmToggle.toggle}
                aria-label={confirmToggle.visible ? 'Hide password' : 'Show password'}
              >
                {confirmToggle.visible ? <IconEyeOff /> : <IconEye />}
              </button>
            }
          />
        </div>
      </div>

      <div className={AUTH_GRID_ROW_ACTIONS_CLASS}>
        <Link href="/login" className={`${authLinkClass} text-center text-sm font-bold text-text`}>
          I already have an account
        </Link>
        <Button
          type="submit"
          size="lg"
          radius="md"
          disabled={loading}
          className={authSubmitButtonClass}
        >
          {loading ? 'Creating…' : 'Create account'}
        </Button>
      </div>
    </form>
  );
}
