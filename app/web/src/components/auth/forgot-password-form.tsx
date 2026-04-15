'use client';

import Link from 'next/link';
import { AuthPasswordField } from '@/components/auth/auth-password-field';
import { AuthField } from '@/components/auth/auth-field';
import {
  authFieldsStackClass,
  authLinkClass,
  authSubmitButtonClass,
} from '@/components/auth/auth-form-shared';
import {
  AUTH_GRID_FORM_CLASS,
  AUTH_GRID_ROW_ACTIONS_CLASS,
  AUTH_GRID_ROW_FIELDS_CLASS,
  AUTH_GRID_ROW_TITLE_CLASS,
  authTitleClassName,
} from '@/components/auth/auth-shell';
import { IconUser } from '@/components/auth/icons';
import { Button } from '@/components/ui/button';
import { useResetPasswordForm } from '@/hooks/use-reset-password-form';

type ForgotPasswordFormProps = {
  title: string;
};

export function ForgotPasswordForm({ title }: ForgotPasswordFormProps) {
  const resetForm = useResetPasswordForm();

  return (
    <form onSubmit={(e) => void resetForm.actions.submit(e)} className={AUTH_GRID_FORM_CLASS}>
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
            value={resetForm.data.email}
            onChange={(e) => resetForm.actions.setEmail(e.target.value)}
          />
          <AuthField
            icon={<IconUser />}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="CPF 000.000.000-00"
            value={resetForm.data.cpfViewValue}
            onChange={(e) => resetForm.actions.setCpfValue(e.target.value)}
          />
          <AuthPasswordField
            value={resetForm.data.newPassword}
            onChange={resetForm.actions.setNewPassword}
            placeholder="New password"
            autoComplete="new-password"
            toggle={resetForm.passwordToggle}
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
          disabled={resetForm.data.loading}
          className={authSubmitButtonClass}
        >
          {resetForm.data.loading ? 'Resetting…' : 'Reset password'}
        </Button>
      </div>
    </form>
  );
}
