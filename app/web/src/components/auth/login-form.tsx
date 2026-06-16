'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { useLoginForm } from '@/hooks/use-login-form';

type LoginFormProps = {
  title: string;
};

export function LoginForm({ title }: LoginFormProps) {
  const router = useRouter();
  const loginForm = useLoginForm({
    onSuccess: () => {
      router.push('/');
      router.refresh();
    },
  });

  return (
    <form onSubmit={(e) => void loginForm.actions.submit(e)} className={AUTH_GRID_FORM_CLASS}>
      <div className={AUTH_GRID_ROW_TITLE_CLASS}>
        <h1 className={authTitleClassName(title)}>{title}</h1>
      </div>

      <div className={AUTH_GRID_ROW_FIELDS_CLASS}>
        <div className={authFieldsStackClass}>
          <AuthField
            icon={<IconUser />}
            type="text"
            inputMode={loginForm.data.identifierInputMode as 'email' | 'numeric'}
            autoComplete="username"
            placeholder="CPF 000.000.000-00"
            value={loginForm.data.identifierViewValue}
            inputClassName={loginForm.data.tones.identifier}
            onChange={(e) => loginForm.actions.setIdentifierValue(e.target.value)}
          />
          <AuthPasswordField
            value={loginForm.data.password}
            onChange={loginForm.actions.setPassword}
            placeholder="Password"
            autoComplete="current-password"
            inputClassName={loginForm.data.tones.password}
            toggle={loginForm.passwordToggles.passToggle}
          />
          <AuthPasswordField
            value={loginForm.data.confirmPassword}
            onChange={loginForm.actions.setConfirmPassword}
            placeholder="Confirm Password"
            autoComplete="new-password"
            inputClassName={loginForm.data.tones.confirmPassword}
            toggle={loginForm.passwordToggles.confirmToggle}
          />
        </div>
        <div className="flex w-full shrink-0 flex-col gap-0">
          <div className="mt-2.5 flex w-full justify-end">
            <Link
              href="/forgot-password"
              className={`${authLinkClass} type-body-strong text-red underline`}
            >
              Forgot my Password?
            </Link>
          </div>
        </div>
      </div>

      <div className={AUTH_GRID_ROW_ACTIONS_CLASS}>
        <Link
          href="/create-account"
          className={`${authLinkClass} cursor-pointer text-center type-body-strong text-text`}
        >
          Create Account
        </Link>
        <Button
          type="submit"
          size="lg"
          radius="md"
          disabled={loginForm.data.loading}
          className={authSubmitButtonClass}
        >
          {loginForm.data.loading ? 'Signing in…' : 'Login Now'}
        </Button>
      </div>
    </form>
  );
}
