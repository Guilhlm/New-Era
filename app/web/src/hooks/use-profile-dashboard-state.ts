'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toastAuthError } from '@/components/auth/auth-error-toast';
import type { EditBaseline, MeUser } from '@/types/profile';
import { PROFILE_UPDATED_EVENT } from '@/utils/events';
import {
  PASSWORD_MASK,
  ageFromBirth,
  fileToResizedDataUrl,
  formatPhoneBrEditable,
  numFromDecimal,
  toDateInput,
} from '@/utils/profile';

const savedFieldTextClass = 'text-grey';
const inputBaseClass =
  'min-h-0 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-text/35';

export function useProfileDashboardState() {
  const [user, setUser] = useState<MeUser | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [pwdSurfaceMode, setPwdSurfaceMode] = useState<'mask' | 'edit'>('mask');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [editBaseline, setEditBaseline] = useState<EditBaseline | null>(null);

  const loadMe = useCallback(async () => {
    setLoadError(null);
    const res = await fetch('/api/auth/me');
    if (!res.ok) {
      setLoadError('Não foi possível carregar o perfil.');
      return;
    }
    const data = (await res.json()) as MeUser;
    const phoneStr = data.phone ?? '';
    const inc = numFromDecimal(data.monthlyIncome);
    const incStr = inc > 0 ? String(inc) : '';
    setUser(data);
    setName(data.name ?? '');
    setEmail(data.email ?? '');
    setBirthDate(toDateInput(data.birthDate));
    setPhone(formatPhoneBrEditable(phoneStr));
    setMonthlyIncome(incStr);
    setNewPassword('');
    setPwdSurfaceMode('mask');
    setShowPass(false);
    setEditBaseline({
      name: (data.name ?? '').trim(),
      email: (data.email ?? '').trim(),
      birthDate: toDateInput(data.birthDate),
      phoneDigits: phoneStr.replace(/\D/g, ''),
      monthlyIncome: incStr,
    });
  }, []);

  useEffect(() => {
    void loadMe();
  }, [loadMe]);

  const balanceUsd = useMemo(() => numFromDecimal(user?.totalBalance), [user]);
  const disciplineRaw = user?.disciplineLevel != null ? Number(user.disciplineLevel) : 25.7;
  const disciplineLabel =
    Math.abs(disciplineRaw - Math.round(disciplineRaw)) < 1e-6
      ? `${Math.round(disciplineRaw)}%`
      : `${disciplineRaw.toFixed(1)}%`;
  const age = ageFromBirth(user?.birthDate ?? null);

  const hasUnsavedChanges = useMemo(() => {
    if (!editBaseline) return false;
    const digits = phone.replace(/\D/g, '');
    if (name.trim() !== editBaseline.name) return true;
    if (email.trim() !== editBaseline.email) return true;
    if (birthDate !== editBaseline.birthDate) return true;
    if (digits !== editBaseline.phoneDigits) return true;
    if (monthlyIncome.trim() !== editBaseline.monthlyIncome) return true;
    if (newPassword.length > 0) return true;
    return false;
  }, [editBaseline, name, email, birthDate, phone, monthlyIncome, newPassword]);

  const pwdEyeEnabled = !saving && hasUnsavedChanges;
  const pwdEyeRed = newPassword.length > 0;

  useEffect(() => {
    if (!hasUnsavedChanges) setShowPass(false);
  }, [hasUnsavedChanges]);

  function toneUnchanged(current: string, baseline: string, normalize: (s: string) => string = (s) => s.trim()) {
    if (!editBaseline) return savedFieldTextClass;
    return normalize(current) === normalize(baseline) ? savedFieldTextClass : 'text-red';
  }

  function tonePwdField() {
    if (pwdSurfaceMode === 'mask') return savedFieldTextClass;
    return newPassword === '' ? savedFieldTextClass : 'text-red';
  }

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  async function onAvatarFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file?.type.startsWith('image/')) {
      toastAuthError('Escolha um arquivo de imagem.');
      return;
    }
    setPhotoUploading(true);
    try {
      const dataUrl = await fileToResizedDataUrl(file);
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoUser: dataUrl }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toastAuthError(data.error || 'Falha ao salvar a foto.');
        return;
      }
      toastAuthError('Foto atualizada.');
      await loadMe();
      window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));
    } catch {
      toastAuthError('Não foi possível processar a imagem.');
    } finally {
      setPhotoUploading(false);
    }
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (newPassword.length > 0 && newPassword.length < 6) {
      toastAuthError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.replace(/\D/g, '') || null,
        birthDate: birthDate ? `${birthDate}T12:00:00.000Z` : null,
        monthlyIncome:
          monthlyIncome.trim() === '' ? null : parseFloat(monthlyIncome.replace(',', '.')),
      };
      if (newPassword) body.password = newPassword;

      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toastAuthError(data.error || 'Falha ao salvar.');
        return;
      }
      toastAuthError('Perfil atualizado.');
      setShowPass(false);
      setPwdSurfaceMode('mask');
      setNewPassword('');
      await loadMe();
      window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));
    } finally {
      setSaving(false);
    }
  }

  const avatarPhoto =
    user?.photoUser &&
    (user.photoUser.startsWith('data:') ||
      user.photoUser.startsWith('http') ||
      user.photoUser.startsWith('/'))
      ? user.photoUser
      : null;

  return {
    user,
    loadError,
    saving,
    showPass,
    setShowPass,
    pwdSurfaceMode,
    setPwdSurfaceMode,
    name,
    setName,
    email,
    setEmail,
    birthDate,
    setBirthDate,
    phone,
    setPhone,
    monthlyIncome,
    setMonthlyIncome,
    newPassword,
    setNewPassword,
    editBaseline,
    balanceUsd,
    disciplineRaw,
    disciplineLabel,
    age,
    hasUnsavedChanges,
    pwdEyeEnabled,
    pwdEyeRed,
    toneUnchanged,
    tonePwdField,
    avatarInputRef,
    photoUploading,
    avatarPhoto,
    onAvatarFileChange,
    onSave,
    savedFieldTextClass,
    inputBaseClass,
    passwordMask: PASSWORD_MASK,
  };
}
