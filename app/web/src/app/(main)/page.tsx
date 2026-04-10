import Image from 'next/image';

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
      <div className="grid overflow-hidden rounded-2xl border border-grey bg-layer1 md:grid-cols-5">
        <div className="space-y-2 p-6 md:col-span-3 md:flex md:flex-col md:justify-center">
          <h2 className="text-xl font-semibold text-text">Visão geral</h2>
          <p className="text-sm text-text/70">
            Painel inicial com estado da API e atalhos para evolução do app.
          </p>
        </div>
        <div className="relative aspect-[4/3] min-h-[200px] md:aspect-auto md:col-span-2 md:min-h-[220px]">
          <Image
            src="/hero-statue.png"
            alt="Escultura clássica em contraste dramático"
            fill
            priority
            className="object-cover object-[center_20%]"
            sizes="(max-width: 768px) 100vw, 40vw"
          />
        </div>
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

      <div className="rounded-xl border border-grey bg-layer2 p-4">
        <h3 className="text-sm font-medium text-text">Próximos passos rápidos</h3>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-text/80">
          <li>Registrar usuário em <code>/auth/register</code>.</li>
          <li>Criar carteira em <code>/finance/wallet</code>.</li>
          <li>Cadastrar treino em <code>/workout</code> e refeição em <code>/diet</code>.</li>
        </ul>
      </div>
    </section>
  );
}
