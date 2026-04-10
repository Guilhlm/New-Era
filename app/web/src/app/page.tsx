import { DashboardCard } from '@/components/dashboard-card';
import { getApiHealth } from '@/services/api';

export default async function Home() {
  let apiStatus = 'Offline';
  let apiDetail = 'Não foi possível consultar o backend.';

  try {
    const health = await getApiHealth();
    apiStatus = health.status.toUpperCase();
    apiDetail = `${health.service} em ${new Date(health.timestamp).toLocaleString('pt-BR')}`;
  } catch {
    apiStatus = 'OFFLINE';
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Visão geral</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Painel inicial com estado da API e atalhos para evolução do app.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <DashboardCard title="API" value={apiStatus} subtitle={apiDetail} />
        <DashboardCard title="Academia" value="0 treinos" subtitle="Crie treinos no endpoint /workout" />
        <DashboardCard
          title="Finanças"
          value="R$ 0,00"
          subtitle="Movimente dados em /finance/wallet e /finance/transaction"
        />
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="text-sm font-medium">Próximos passos rápidos</h3>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-300">
          <li>Registrar usuário em <code>/auth/register</code>.</li>
          <li>Criar carteira em <code>/finance/wallet</code>.</li>
          <li>Cadastrar treino em <code>/workout</code> e refeição em <code>/diet</code>.</li>
        </ul>
      </div>
    </section>
  );
}
