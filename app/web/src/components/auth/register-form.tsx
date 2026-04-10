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

type RegisterFormProps = {
  title: string;
};

export function RegisterForm({ title }: RegisterFormProps) {
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
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
        <div className="flex w-full max-w-full flex-col gap-[10px]">
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
            type={show1 ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            right={
              <button
                type="button"
                className="cursor-pointer rounded p-1 text-grey-text transition hover:bg-white/5 hover:text-grey-text"
                onClick={() => setShow1((s) => !s)}
                aria-label={show1 ? 'Hide password' : 'Show password'}
              >
                {show1 ? <IconEyeOff /> : <IconEye />}
              </button>
            }
          />
          <AuthField
            icon={<IconKey />}
            type={show2 ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Confirm Password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            right={
              <button
                type="button"
                className="cursor-pointer rounded p-1 text-grey-text transition hover:bg-white/5 hover:text-grey-text"
                onClick={() => setShow2((s) => !s)}
                aria-label={show2 ? 'Hide password' : 'Show password'}
              >
                {show2 ? <IconEyeOff /> : <IconEye />}
              </button>
            }
          />
        </div>
      </div>

      <div className={AUTH_GRID_ROW_ACTIONS_CLASS}>
        <Link href="/login" className={`${linkClass} text-center text-sm font-bold text-text`}>
          I already have an account
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="h-[67px] w-full max-w-full cursor-pointer rounded-[5px] bg-red text-[15px] font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Creating…' : 'Create account'}
        </button>
      </div>
    </form>
  );
}
