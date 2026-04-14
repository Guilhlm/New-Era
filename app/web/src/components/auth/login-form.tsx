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

function looksLikeEmail(s: string) {
  return s.includes('@') || /[a-zA-Z]/.test(s);
}

const AUTH_INPUT_SAVED_CLASS = 'text-input-idle';

function normLoginIdentifier(s: string) {
  return looksLikeEmail(s) ? s.trim().toLowerCase() : s.replace(/\D/g, '');
}

function loginInputTone(current: string, baseline: string, normalize: (s: string) => string) {
  return normalize(current) === normalize(baseline) ? AUTH_INPUT_SAVED_CLASS : 'text-red';
}

type LoginFormProps = {
  title: string;
};

export function LoginForm({ title }: LoginFormProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const passToggle = usePasswordToggle(false);
  const confirmToggle = usePasswordToggle(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      toastAuthError('Passwords do not match.');
      return;
    }
    setLoading(true);
    let resetLoading = true;
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toastAuthError(data.error || 'Invalid credentials.');
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
            inputMode={looksLikeEmail(identifier) ? 'email' : 'numeric'}
            autoComplete="username"
            placeholder="CPF 000.000.000-00"
            value={looksLikeEmail(identifier) ? identifier : formatCpfInput(identifier)}
            inputClassName={loginInputTone(identifier, '', normLoginIdentifier)}
            onChange={(e) => {
              const v = e.target.value;
              if (looksLikeEmail(v)) setIdentifier(v);
              else setIdentifier(formatCpfInput(v));
            }}
          />
          <AuthField
            icon={<IconKey />}
            type={passToggle.inputType}
            autoComplete="current-password"
            placeholder="Password"
            value={password}
            inputClassName={loginInputTone(password, '', (s) => s)}
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
            value={confirmPassword}
            inputClassName={loginInputTone(confirmPassword, '', (s) => s)}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
        <div className="flex w-full shrink-0 flex-col gap-0">
          <div className="mt-2.5 flex w-full justify-end">
            <Link
              href="/forgot-password"
              className={`${authLinkClass} text-sm font-bold text-red underline`}
            >
              Forgot my Password?
            </Link>
          </div>
        </div>
      </div>

      <div className={AUTH_GRID_ROW_ACTIONS_CLASS}>
        <Link
          href="/create-account"
          className={`${authLinkClass} cursor-pointer text-center text-sm font-bold text-text`}
        >
          Create Account
        </Link>
        <Button
          type="submit"
          size="lg"
          radius="md"
          disabled={loading}
          className={authSubmitButtonClass}
        >
          {loading ? 'Signing in…' : 'Login Now'}
        </Button>
      </div>
    </form>
  );
}
