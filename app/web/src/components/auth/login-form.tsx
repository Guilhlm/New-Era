'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toastAuthError } from '@/components/auth/auth-error-toast';

import { AuthField } from '@/components/auth/auth-field';
import {
  AUTH_GRID_FORM_CLASS,
  AUTH_GRID_ROW_ACTIONS_CLASS,
  AUTH_GRID_ROW_FIELDS_CLASS,
  AUTH_GRID_ROW_TITLE_CLASS,
  authTitleClassName,
} from '@/components/auth/auth-shell';
import { IconEye, IconEyeOff, IconKey, IconUser } from '@/components/auth/icons';

const linkClass =
  'cursor-pointer transition hover:opacity-90 hover:brightness-110 active:opacity-80';

function formatCpfInput(raw: string) {
  const d = raw.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

function looksLikeEmail(s: string) {
  return s.includes('@') || /[a-zA-Z]/.test(s);
}

type LoginFormProps = {
  title: string;
};

export function LoginForm({ title }: LoginFormProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      toastAuthError('Passwords do not match.');
      return;
    }
    setLoading(true);
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
      router.push('/');
      router.refresh();
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
        <div className="flex w-full max-w-full flex-col gap-[10px]">
          <AuthField
            icon={<IconUser />}
            type="text"
            inputMode={looksLikeEmail(identifier) ? 'email' : 'numeric'}
            autoComplete="username"
            placeholder="CPF 000.000.000-00"
            value={looksLikeEmail(identifier) ? identifier : formatCpfInput(identifier)}
            onChange={(e) => {
              const v = e.target.value;
              if (looksLikeEmail(v)) setIdentifier(v);
              else setIdentifier(formatCpfInput(v));
            }}
          />
          <AuthField
            icon={<IconKey />}
            type={showPass ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            right={
              <button
                type="button"
                className="cursor-pointer rounded p-1 text-grey-text transition hover:bg-white/5 hover:text-grey-text"
                onClick={() => setShowPass((s) => !s)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? <IconEyeOff /> : <IconEye />}
              </button>
            }
          />
          <AuthField
            icon={<IconKey />}
            type={showConfirm ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            right={
              <button
                type="button"
                className="cursor-pointer rounded p-1 text-grey-text transition hover:bg-white/5 hover:text-grey-text"
                onClick={() => setShowConfirm((s) => !s)}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <IconEyeOff /> : <IconEye />}
              </button>
            }
          />
        </div>
        <div className="flex w-full shrink-0 flex-col gap-0">
          <div className="mt-[10px] flex w-full justify-end">
            <Link
              href="/forgot-password"
              className={`${linkClass} text-sm font-bold text-red underline`}
            >
              Forgot my Password?
            </Link>
          </div>
        </div>
      </div>

      <div className={AUTH_GRID_ROW_ACTIONS_CLASS}>
        <Link href="/create-account" className={`${linkClass} text-center text-sm font-bold text-text`}>
          Create Account
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="h-[67px] w-full max-w-full cursor-pointer rounded-[5px] bg-red text-[15px] font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Signing in…' : 'Login Now'}
        </button>
      </div>
    </form>
  );
}
