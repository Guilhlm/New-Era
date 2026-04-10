import { AuthShell } from '@/components/auth/auth-shell';
import { RegisterForm } from '@/components/auth/register-form';

export default function CreateAccountPage() {
  return (
    <AuthShell>
      <RegisterForm title="Create Account" />
    </AuthShell>
  );
}
