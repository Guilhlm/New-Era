export type MeUser = {
  id: string;
  name: string;
  email: string;
  cpf?: string | null;
  birthDate: string | null;
  phone: string | null;
  monthlyIncome: string | number | null;
  totalBalance: string | number | null;
  disciplineLevel: number | null;
  isAdmin: boolean;
  photoUser: string | null;
  themePreference?: 'dark' | 'light' | null;
};

export type EditBaseline = {
  name: string;
  email: string;
  birthDate: string;
  phoneDigits: string;
  monthlyIncome: string;
};

export type ChartTab = 'training' | 'financial';
export type Period = 7 | 14 | 30;
