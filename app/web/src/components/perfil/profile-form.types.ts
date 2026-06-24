import type { ChangeEvent, FormEvent, RefObject } from 'react';
import type { PasswordFieldModel } from '@/hooks/use-password-field';

export type ProfileFormModel = {
  data: {
    name: string;
    email: string;
    birthDate: string;
    phone: string;
    monthlyIncome: string;
    ageValue: string;
  };
  ui: {
    saving: boolean;
    hasUnsavedChanges: boolean;
    tones: {
      name: string;
      email: string;
      birthDate: string;
      phone: string;
      monthlyIncome: string;
    };
    inputBaseClass: string;
    savedFieldTextClass: string;
  };
  password: PasswordFieldModel;
};

export type ProfileHeaderData = {
  isAdmin: boolean;
};

export type ProfileHeaderProps = {
  data: ProfileHeaderData;
  actions: {
    deletingAccount: boolean;
    onDeleteAccount: () => void;
  };
};

export type AvatarPickerProps = {
  userName: string;
  avatarPhoto: string | null;
  avatarInputRef: RefObject<HTMLInputElement | null>;
  photoUploading: boolean;
  onAvatarFileChange: (e: ChangeEvent<HTMLInputElement>) => Promise<void>;
};

export type ProfileFormCardData = {
  userName: string;
  isAdmin: boolean;
  form: ProfileFormModel['data'];
  formUi: ProfileFormModel['ui'];
  password: ProfileFormModel['password'];
  avatarPhoto: string | null;
  photoUploading: boolean;
};

export type ProfileFormCardActions = {
  onSubmit: (e: FormEvent) => Promise<void>;
  setName: (value: string) => void;
  setEmail: (value: string) => void;
  setBirthDate: (value: string) => void;
  setPhoneEditable: (value: string) => void;
  setMonthlyIncome: (value: string) => void;
  setNewPassword: (value: string) => void;
  openPasswordEdit: () => void;
  handlePasswordBlur: () => void;
  togglePasswordVisibility: () => void;
  onAvatarFileChange: (e: ChangeEvent<HTMLInputElement>) => Promise<void>;
  avatarInputRef: RefObject<HTMLInputElement | null>;
  deletingAccount: boolean;
  onDeleteAccount: () => void;
};
