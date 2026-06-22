/**
 * Backward-compatible aliases. The canonical tokens now live in
 * `@/components/ui/dialog-form-layout`. Prefer importing from there in new code.
 */
import {
  dialogFormActionsClass,
  dialogFormClass,
  dialogFormFieldClass,
  dialogFormInputClass,
  dialogFormPrimaryActionsClass,
  dialogFormSectionClass,
  dialogFormSegmentClass,
  dialogFormSegmentItemClass,
} from '@/components/ui/dialog-form-layout';

export const walletDialogFormClass = dialogFormClass;
export const walletDialogSectionClass = dialogFormSectionClass;
export const walletDialogActionsClass = dialogFormActionsClass;
export const walletDialogPrimaryActionsClass = dialogFormPrimaryActionsClass;
export const walletDialogSegmentClass = dialogFormSegmentClass;
export const walletDialogSegmentItemClass = dialogFormSegmentItemClass;
export const walletDialogFieldClass = dialogFormFieldClass;
export const walletDialogSelectClass = dialogFormInputClass;
