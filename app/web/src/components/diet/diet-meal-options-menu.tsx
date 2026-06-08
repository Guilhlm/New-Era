'use client';

import { EntityOptionsMenu } from '@/components/ui/entity-options-menu';

const MEAL_OPTIONS_LABELS = {
  triggerAriaLabel: 'Opções da refeição',
  rename: 'Renomear',
  delete: 'Excluir refeição',
  renameTitle: 'Renomear refeição',
  deleteTitle: 'Excluir refeição',
  deleteDescription: (entityName: string) =>
    `Tem certeza que deseja excluir ${entityName}? Os ingredientes desta refeição também serão removidos.`,
  save: 'Salvar',
  cancel: 'Cancelar',
  confirmDelete: 'Excluir',
} as const;

type DietMealOptionsMenuProps = {
  mealName: string;
  onRename: (name: string) => void;
  onDelete: () => void;
  disabled?: boolean;
};

export function DietMealOptionsMenu({ mealName, onRename, onDelete, disabled = false }: DietMealOptionsMenuProps) {
  return (
    <EntityOptionsMenu
      entityName={mealName}
      onRename={onRename}
      onDelete={onDelete}
      disabled={disabled}
      labels={MEAL_OPTIONS_LABELS}
    />
  );
}
