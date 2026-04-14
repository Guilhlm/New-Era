import { Card } from '@/components/ui/card';
import { DisciplineRing } from '@/components/perfil/discipline-ring';

type DisciplineCardProps = {
  disciplineRaw: number;
  disciplineLabel: string;
};

export function DisciplineCard({ disciplineRaw, disciplineLabel }: DisciplineCardProps) {
  return (
    <Card
      className="flex flex-col items-center justify-center px-6 py-5 lg:px-7 lg:py-4"
      style={{
        gridColumn: '5 / 6',
        gridRow: '1 / 2',
      }}
    >
      <DisciplineRing percent={Math.min(100, Math.max(0, disciplineRaw))} label={disciplineLabel} />
      <p className="mt-2 text-center text-xs font-medium text-text">Discipline Level</p>
    </Card>
  );
}
