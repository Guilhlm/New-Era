'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/cn';

type EditModeFooterButtonProps = {
  dirty: boolean;
  saving?: boolean;
  disabled?: boolean;
  saveDisabled?: boolean;
  className?: string;
  onSave: () => void;
  onCancel: () => void;
};

export function EditModeFooterButton({
  dirty,
  saving = false,
  disabled = false,
  saveDisabled = false,
  className,
  onSave,
  onCancel,
}: EditModeFooterButtonProps) {
  const blocked = disabled || saving;

  return (
    <Button
      type="button"
      variant="primary"
      size="sm"
      disabled={blocked || (dirty && saveDisabled)}
      className={cn('w-full', !dirty && 'bg-layer2 text-text hover:bg-layer2-half', className)}
      onClick={() => {
        if (dirty) onSave();
        else onCancel();
      }}
    >
      {saving ? 'Saving…' : dirty ? 'Save' : 'Cancel'}
    </Button>
  );
}
