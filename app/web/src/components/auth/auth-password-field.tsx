'use client';

import { AuthField } from '@/components/auth/auth-field';
import { authPasswordToggleButtonClass } from '@/components/auth/auth-form-shared';
import { IconEye, IconEyeOff, IconKey } from '@/components/auth/icons';
import type { PasswordToggleState } from '@/hooks/use-password-toggle';

type AuthPasswordFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoComplete: string;
  toggle: PasswordToggleState;
  inputClassName?: string;
};

export function AuthPasswordField({
  value,
  onChange,
  placeholder,
  autoComplete,
  toggle,
  inputClassName,
}: AuthPasswordFieldProps) {
  return (
    <AuthField
      icon={<IconKey />}
      type={toggle.inputType}
      autoComplete={autoComplete}
      placeholder={placeholder}
      value={value}
      inputClassName={inputClassName}
      onChange={(e) => onChange(e.target.value)}
      right={
        <button
          type="button"
          className={authPasswordToggleButtonClass}
          onClick={toggle.toggle}
          aria-label={toggle.visible ? 'Hide password' : 'Show password'}
        >
          {toggle.visible ? <IconEyeOff /> : <IconEye />}
        </button>
      }
    />
  );
}
