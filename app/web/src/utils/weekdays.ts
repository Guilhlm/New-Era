export const WEEKDAYS = [
  { index: 0, label: 'Sunday', shortLabel: 'Sun' },
  { index: 1, label: 'Monday', shortLabel: 'Mon' },
  { index: 2, label: 'Tuesday', shortLabel: 'Tue' },
  { index: 3, label: 'Wednesday', shortLabel: 'Wed' },
  { index: 4, label: 'Thursday', shortLabel: 'Thu' },
  { index: 5, label: 'Friday', shortLabel: 'Fri' },
  { index: 6, label: 'Saturday', shortLabel: 'Sat' },
] as const;

export function weekdayLabelForIndex(weekday: number) {
  return WEEKDAYS.find((day) => day.index === weekday)?.label ?? 'Rest Day';
}
