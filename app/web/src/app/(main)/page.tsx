import { DashboardCard } from '@/components/dashboard-card';
import { Card } from '@/components/ui/card';
import { getApiHealth } from '@/services/api';

export default async function Home() {
  let apiStatus = 'Offline';
  let apiDetail = 'Could not reach the backend.';

  try {
    const health = await getApiHealth();
    apiStatus = health.status.toUpperCase();
    apiDetail = `${health.service} at ${new Date(health.timestamp).toLocaleString('en-US')}`;
  } catch {
    apiStatus = 'OFFLINE';
  }

  return (
    <section className="space-y-6">
      <div className="grid overflow-hidden rounded-2xl border border-grey bg-layer1 md:grid-cols-5">
        <div className="space-y-2 p-6 md:col-span-3 md:flex md:flex-col md:justify-center">
          <h2 className="text-xl font-semibold text-text">Overview</h2>
          <p className="text-sm text-text/70">
            Starter dashboard with API status and shortcuts for building the app.
          </p>
        </div>
        <div className="relative aspect-[4/3] min-h-52 overflow-hidden md:col-span-2 md:aspect-auto md:min-h-56">
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(120% 90% at 30% 20%, rgba(124,58,237,.55), rgba(124,58,237,0) 60%), radial-gradient(120% 90% at 80% 70%, rgba(56,189,248,.35), rgba(56,189,248,0) 55%), linear-gradient(135deg, rgba(17,24,39,.9), rgba(17,24,39,.55))',
            }}
            aria-hidden
          />
          <div className="relative z-10 flex h-full w-full items-end p-6">
            <p className="text-sm font-medium text-white/80">New Era</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <DashboardCard title="API" value={apiStatus} subtitle={apiDetail} />
        <DashboardCard title="Training" value="0 workouts" subtitle="Create workouts at /workout" />
        <DashboardCard
          title="Finances"
          value="R$ 0,00"
          subtitle="Post data to /finance/wallet and /finance/transaction"
        />
      </div>

      <Card variant="border" padding="sm" className="bg-layer2">
        <h3 className="text-sm font-medium text-text">Quick next steps</h3>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-text/80">
          <li>Register a user at <code>/auth/register</code>.</li>
          <li>Create a wallet at <code>/finance/wallet</code>.</li>
          <li>Create a workout at <code>/workout</code> and a meal at <code>/diet</code>.</li>
        </ul>
      </Card>
    </section>
  );
}
