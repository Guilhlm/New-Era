import { PerfilDashboard } from '@/components/dashboards-lazy';

export default function PerfilPage() {
  return (
    <section className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col">
      <h1 className="sr-only">Profile</h1>
      <PerfilDashboard />
    </section>
  );
}
