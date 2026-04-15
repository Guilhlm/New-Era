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
      <DisciplineRing
        percent={Math.min(100, Math.max(0, disciplineRaw))}
        value={disciplineLabel}
        caption="Discipline Level"
      />
    </Card>
  );
}
