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
import { useRegisterForm } from '@/hooks/use-register-form';

type RegisterFormProps = {
  title: string;
};

export function RegisterForm({ title }: RegisterFormProps) {
  const router = useRouter();
  const registerForm = useRegisterForm({
    onSuccess: () => {
      router.push('/');
      router.refresh();
    },
  });

  return (
    <form onSubmit={(e) => void registerForm.actions.submit(e)} className={AUTH_GRID_FORM_CLASS}>
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
            value={registerForm.data.cpfViewValue}
            onChange={(e) => registerForm.actions.setCpfValue(e.target.value)}
          />
          <AuthPasswordField
            value={registerForm.data.password}
            onChange={registerForm.actions.setPassword}
            placeholder="Password"
            autoComplete="new-password"
            toggle={registerForm.passwordToggles.passToggle}
          />
          <AuthPasswordField
            value={registerForm.data.confirmPassword}
            onChange={registerForm.actions.setConfirmPassword}
            placeholder="Confirm Password"
            autoComplete="new-password"
            toggle={registerForm.passwordToggles.confirmToggle}
          />
        </div>
      </div>

      <div className={AUTH_GRID_ROW_ACTIONS_CLASS}>
        <Link href="/login" className={`${authLinkClass} text-center type-body-strong text-text`}>
          I already have an account
        </Link>
        <Button
          type="submit"
          size="lg"
          radius="md"
          disabled={registerForm.data.loading}
          className={authSubmitButtonClass}
        >
          {registerForm.data.loading ? 'Creating…' : 'Create account'}
        </Button>
      </div>
    </form>
  );
}
