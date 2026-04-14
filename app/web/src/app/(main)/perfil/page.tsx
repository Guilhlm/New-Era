import { PerfilDashboard } from '@/components/perfil/perfil-dashboard';

export default function PerfilPage() {
  return (
    <section className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col">
      <h1 className="sr-only">Perfil</h1>
      <PerfilDashboard />
    </section>
  );
}
