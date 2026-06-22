/**
 * Shared spacing/surface tokens for dialog forms across the app (wallet, finance
 * goals, monthly expenses). Canonical location; feature modules should import from
 * here. `wallet-dialog-layout.ts` re-exports these for backward compatibility.
 */
export const dialogFormClass = 'flex flex-col gap-5 px-6 py-6 sm:px-7 sm:py-7';
export const dialogFormSectionClass = 'rounded-lg bg-layer2 px-4 py-3.5';
export const dialogFormActionsClass =
  'flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:items-center sm:justify-end';
export const dialogFormPrimaryActionsClass = 'flex w-full flex-col gap-3 sm:flex-1 sm:flex-row';
export const dialogFormSegmentClass = 'h-10 w-full';
export const dialogFormSegmentItemClass = 'flex-1 px-3 py-2';
export const dialogFormFieldClass = 'flex flex-col gap-2.5';
export const dialogFormInputClass =
  'min-h-11 rounded-md bg-layer2 px-4 py-2.5 text-text outline-none focus-visible:ring-2 focus-visible:ring-red/60';
