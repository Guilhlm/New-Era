import { IconEye, IconEyeOff } from '@/components/auth/icons';
import { ProfileField } from '@/components/perfil/profile-field';
import { cn } from '@/components/ui/cn';

type ProfilePasswordFieldProps = {
  inputBaseClass: string;
  toneClass: string;
  data: {
    inputType: string;
    readOnly: boolean;
    value: string;
    placeholder: string;
    eyeEnabled: boolean;
    showPass: boolean;
  };
  actions: {
    setNewPassword: (value: string) => void;
    openEditMode: () => void;
    handleBlur: () => void;
    toggleVisibility: () => void;
  };
};

export function ProfilePasswordField({ inputBaseClass, toneClass, data, actions }: ProfilePasswordFieldProps) {
  const eyeStateClass = data.eyeEnabled
    ? 'text-red [&_button]:cursor-pointer [&_button]:text-red'
    : 'text-grey [&_button]:cursor-not-allowed [&_button]:text-grey';

  return (
    <ProfileField label="Password:">
      <div className="min-w-0 flex-1">
        <input
          type={data.inputType}
          readOnly={data.readOnly}
          className={cn(inputBaseClass, toneClass, 'w-full', data.readOnly ? 'cursor-pointer' : 'cursor-text')}
          placeholder={data.placeholder}
          value={data.value}
          onClick={() => {
            if (data.readOnly) actions.openEditMode();
          }}
          onChange={(e) => actions.setNewPassword(e.target.value)}
          onBlur={actions.handleBlur}
          autoComplete="off"
          spellCheck={false}
          aria-label="Password"
        />
      </div>
      <span className={cn('-translate-x-5 shrink-0 [&_svg]:text-current', eyeStateClass)}>
        <button
          type="button"
          disabled={!data.eyeEnabled}
          className={cn('rounded p-1 transition hover:bg-white/5 disabled:opacity-50', !data.eyeEnabled && 'opacity-50')}
          onMouseDown={(e) => data.eyeEnabled && e.preventDefault()}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            actions.toggleVisibility();
          }}
          aria-label={data.showPass ? 'Hide password' : 'Show password'}
          aria-disabled={!data.eyeEnabled}
        >
          {data.showPass ? <IconEyeOff /> : <IconEye />}
        </button>
      </span>
    </ProfileField>
  );
}
