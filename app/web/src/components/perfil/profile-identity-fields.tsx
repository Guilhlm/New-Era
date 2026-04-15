import { ProfileField } from '@/components/perfil/profile-field';
import { cn } from '@/components/ui/cn';

type ProfileIdentityFieldsProps = {
  data: {
    name: string;
    ageValue: string;
    email: string;
    birthDate: string;
    phone: string;
    monthlyIncome: string;
  };
  ui: {
    inputBaseClass: string;
    savedFieldTextClass: string;
    tones: {
      name: string;
      email: string;
      birthDate: string;
      phone: string;
      monthlyIncome: string;
    };
  };
  actions: {
    setName: (value: string) => void;
    setEmail: (value: string) => void;
    setBirthDate: (value: string) => void;
    setPhoneEditable: (value: string) => void;
    setMonthlyIncome: (value: string) => void;
  };
};

export function ProfileIdentityFields({ data, ui, actions }: ProfileIdentityFieldsProps) {
  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-3 gap-1.5">
        <ProfileField label="Name:" className="col-span-2">
          <input
            className={cn(ui.inputBaseClass, ui.tones.name, 'cursor-text')}
            value={data.name}
            onChange={(e) => actions.setName(e.target.value)}
            required
            aria-label="Name"
          />
        </ProfileField>
        <ProfileField label="Age:" className="col-span-1">
          <input
            className={cn(ui.inputBaseClass, ui.savedFieldTextClass)}
            value={data.ageValue}
            readOnly
            tabIndex={-1}
            aria-label="Age"
          />
        </ProfileField>
      </div>

      <ProfileField label="Email:">
        <input
          type="email"
          className={cn(ui.inputBaseClass, ui.tones.email, 'cursor-text')}
          value={data.email}
          onChange={(e) => actions.setEmail(e.target.value)}
          required
          aria-label="Email"
        />
      </ProfileField>

      <div className="grid grid-cols-2 gap-1.5">
        <ProfileField label="Birth date:">
          <input
            type="date"
            className={cn('input-no-native-date min-w-0 cursor-pointer', ui.inputBaseClass, ui.tones.birthDate)}
            value={data.birthDate}
            onChange={(e) => actions.setBirthDate(e.target.value)}
            aria-label="Birth date"
          />
        </ProfileField>
        <ProfileField label="Phone:">
          <input
            className={cn(ui.inputBaseClass, ui.tones.phone, 'cursor-text')}
            value={data.phone}
            onChange={(e) => actions.setPhoneEditable(e.target.value)}
            placeholder="(11) 99999-9999"
            inputMode="tel"
            autoComplete="tel"
            aria-label="Phone"
          />
        </ProfileField>
      </div>

      <ProfileField label="Monthly income:">
        <div className="flex min-w-0 flex-1 items-center">
          <span className={cn('pointer-events-none text-sm', ui.tones.monthlyIncome)}>R$</span>
          <input
            type="number"
            step="0.01"
            min={0}
            className={cn('input-no-native-spin cursor-text pl-0', ui.inputBaseClass, ui.tones.monthlyIncome)}
            value={data.monthlyIncome}
            onChange={(e) => actions.setMonthlyIncome(e.target.value)}
            placeholder="0000"
            aria-label="Monthly income (BRL)"
          />
        </div>
      </ProfileField>
    </div>
  );
}
