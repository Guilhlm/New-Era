'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/cn';

type DialogFormActionsProps = {
  submitLabel: string;
  cancelLabel?: string;
  saving?: boolean;
  disabled?: boolean;
  onCancel: () => void;
};

/** Submit + cancel pair shared across create/edit dialog forms. */
export function DialogFormActions({
  submitLabel,
  cancelLabel = 'Cancel',
  saving = false,
  disabled = false,
  onCancel,
}: DialogFormActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        type="submit"
        variant="primary"
        size="sm"
        disabled={saving || disabled}
        className="flex-1"
      >
        {submitLabel}
      </Button>
      <Button
        type="button"
        variant="primary"
        size="sm"
        disabled={saving}
        className={cn('bg-layer2 text-text hover:bg-layer2-half')}
        onClick={onCancel}
      >
        {cancelLabel}
      </Button>
    </div>
  );
}
