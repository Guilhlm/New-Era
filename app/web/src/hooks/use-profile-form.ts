'use client';

import { useEffect, useMemo, useState } from 'react';
import { toastAuthError } from '@/components/auth/auth-error-toast';
import { usePasswordField } from '@/hooks/use-password-field';
import { updateProfile } from '@/services/profile';
import type { EditBaseline, MeUser } from '@/types/profile';
import { PROFILE_UPDATED_EVENT } from '@/utils/events';
import { ageFromBirth, formatPhoneBrEditable, numFromDecimal, toDateInput } from '@/utils/profile';

const savedFieldTextClass = 'text-grey';
const inputBaseClass =
  'min-h-0 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-text/35';

type UseProfileFormParams = {
  user: MeUser | null;
  onProfileUpdated: () => Promise<void>;
};

function normalizePhone(value: string) {
  return value.replace(/\D/g, '');
}

function getTone(current: string, baseline: string, normalize: (value: string) => string = (value) => value.trim()) {
  return normalize(current) === normalize(baseline) ? savedFieldTextClass : 'text-red';
}

export function useProfileForm({ user, onProfileUpdated }: UseProfileFormParams) {
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [editBaseline, setEditBaseline] = useState<EditBaseline | null>(null);

  useEffect(() => {
    if (!user) return;
    const phoneRaw = user.phone ?? '';
    const incomeNumber = numFromDecimal(user.monthlyIncome);
    const incomeText = incomeNumber > 0 ? String(incomeNumber) : '';

    setName(user.name ?? '');
    setEmail(user.email ?? '');
    setBirthDate(toDateInput(user.birthDate));
    setPhone(formatPhoneBrEditable(phoneRaw));
    setMonthlyIncome(incomeText);
    setEditBaseline({
      name: (user.name ?? '').trim(),
      email: (user.email ?? '').trim(),
      birthDate: toDateInput(user.birthDate),
      phoneDigits: normalizePhone(phoneRaw),
      monthlyIncome: incomeText,
    });
  }, [user]);

  const hasChangesWithoutPassword = useMemo(() => {
    if (!editBaseline) return false;
    if (name.trim() !== editBaseline.name) return true;
    if (email.trim() !== editBaseline.email) return true;
    if (birthDate !== editBaseline.birthDate) return true;
    if (normalizePhone(phone) !== editBaseline.phoneDigits) return true;
    if (monthlyIncome.trim() !== editBaseline.monthlyIncome) return true;
    return false;
  }, [birthDate, editBaseline, email, monthlyIncome, name, phone]);

  const password = usePasswordField({ saving, hasChangesWithoutPassword });
  const hasUnsavedChanges = hasChangesWithoutPassword || password.data.newPassword.length > 0;
  const ageValue = useMemo(() => {
    const age = ageFromBirth(birthDate || null);
    return age != null ? String(age) : '—';
  }, [birthDate]);

  const tones = useMemo(
    () => ({
      name: getTone(name, editBaseline?.name ?? ''),
      email: getTone(email, editBaseline?.email ?? ''),
      birthDate: getTone(birthDate, editBaseline?.birthDate ?? ''),
      phone: getTone(phone, editBaseline?.phoneDigits ?? '', normalizePhone),
      monthlyIncome: getTone(monthlyIncome, editBaseline?.monthlyIncome ?? ''),
    }),
    [birthDate, editBaseline, email, monthlyIncome, name, phone],
  );

  function setPhoneEditable(value: string) {
    setPhone(formatPhoneBrEditable(value));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (password.data.newPassword.length > 0 && password.data.newPassword.length < 6) {
      toastAuthError('Password must be at least 6 characters.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        phone: normalizePhone(phone) || null,
        birthDate: birthDate ? `${birthDate}T12:00:00.000Z` : null,
        monthlyIncome: monthlyIncome.trim() === '' ? null : parseFloat(monthlyIncome.replace(',', '.')),
        ...(password.data.newPassword ? { password: password.data.newPassword } : null),
      };

      await updateProfile(payload);
      toastAuthError('Profile updated.');
      password.actions.resetToMask();
      await onProfileUpdated();
      window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save.';
      toastAuthError(message);
    } finally {
      setSaving(false);
    }
  }

  return {
    data: {
      name,
      email,
      birthDate,
      phone,
      monthlyIncome,
      ageValue,
    },
    ui: {
      saving,
      hasUnsavedChanges,
      tones,
      inputBaseClass,
      savedFieldTextClass,
    },
    password,
    actions: {
      setName,
      setEmail,
      setBirthDate,
      setPhoneEditable,
      setMonthlyIncome,
      submit,
    },
  };
}
