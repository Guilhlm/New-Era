import { HomeDashboard } from '@/components/home/home-dashboard';

export default async function Home() {
  return (
    <HomeDashboard
      discipline={{ percent: 0, label: '0%' }}
      tasks={[
        { rank: '1º', title: 'one' },
        { rank: '2º', title: 'two'},
        { rank: '3º', title: 'tree' },
        { rank: '4º', title: 'four' },
        { rank: '5º', title: 'five' },
        { rank: '6º', title: 'six' },
        { rank: '7º', title: 'seven' },
        { rank: '8º', title: 'eigth'},
        { rank: '9º', title: 'nine'},
        { rank: '10º', title: 'ten'},
      ]}
    />
  );
}
