'use client';

import Link from 'next/link';
import { cn } from '@/components/ui/cn';
import { typeToneClass } from '@/lib/typography';
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
  const isConfirm = resetForm.data.step === 'confirm';

  const onSubmit = (e: React.FormEvent) =>
    void (isConfirm
      ? resetForm.actions.submitConfirm(e)
      : resetForm.actions.submitRequest(e));

  return (
    <form onSubmit={onSubmit} className={AUTH_GRID_FORM_CLASS}>
      <div className={AUTH_GRID_ROW_TITLE_CLASS}>
        <h1 className={authTitleClassName(title)}>{title}</h1>
      </div>

      <div className={AUTH_GRID_ROW_FIELDS_CLASS}>
        <div className={authFieldsStackClass}>
          {isConfirm ? (
            <>
              <p className={cn('type-body m-0 text-center leading-relaxed', typeToneClass.accent)}>
                Enter the reset code generated for your account and choose a new password
                (at least 8 characters).
              </p>
              <AuthField
                icon={<IconUser />}
                type="text"
                autoComplete="one-time-code"
                placeholder="Reset code"
                value={resetForm.data.token}
                onChange={(e) => resetForm.actions.setToken(e.target.value)}
              />
              <AuthPasswordField
                value={resetForm.data.newPassword}
                onChange={resetForm.actions.setNewPassword}
                placeholder="New password"
                autoComplete="new-password"
                toggle={resetForm.passwordToggle}
              />
            </>
          ) : (
            <>
              <p className={cn('type-body m-0 text-center leading-relaxed', typeToneClass.accent)}>
                Enter the email and CPF registered on the same account. If they match, a single-use
                reset code will be generated so you can set a new password.
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
            </>
          )}
        </div>
      </div>

      <div className={AUTH_GRID_ROW_ACTIONS_CLASS}>
        {isConfirm ? (
          <button
            type="button"
            onClick={resetForm.actions.backToRequest}
            className={`${authLinkClass} text-center type-body-strong text-text`}
          >
            Use another account
          </button>
        ) : (
          <Link href="/login" className={`${authLinkClass} text-center type-body-strong text-text`}>
            Back to login
          </Link>
        )}
        <Button
          type="submit"
          size="lg"
          radius="md"
          disabled={resetForm.data.loading}
          className={authSubmitButtonClass}
        >
          {resetForm.data.loading
            ? isConfirm
              ? 'Resetting…'
              : 'Sending…'
            : isConfirm
              ? 'Reset password'
              : 'Send reset code'}
        </Button>
      </div>
    </form>
  );
}
