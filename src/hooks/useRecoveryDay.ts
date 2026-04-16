import { useMemo } from 'react';

export function useRecoveryDay(dischargeDate: string | null | undefined) {
  return useMemo(() => {
    if (!dischargeDate) {
      return { currentDay: 1, days: [1, 2], dischargeTimestamp: 0 };
    }

    const discharge = new Date(dischargeDate);
    const now = Date.now();
    const diffMs = now - discharge.getTime();
    const currentDay = Math.max(0, Math.floor(diffMs / 86400000) + 1);

    const adjustedDay = diffMs < 0 ? 0 : currentDay;

    let days: number[];
    if (adjustedDay === 0) {
      days = [0, 1];
    } else if (adjustedDay === 1) {
      days = [1, 2];
    } else {
      days = [adjustedDay - 1, adjustedDay, adjustedDay + 1];
    }

    return { currentDay: adjustedDay, days, dischargeTimestamp: discharge.getTime() };
  }, [dischargeDate]);
}

export function getDayDate(dischargeDate: string, dayNumber: number): Date {
  const d = new Date(dischargeDate);
  d.setDate(d.getDate() + dayNumber - 1);
  return d;
}

export function getDayDateString(dischargeDate: string, dayNumber: number): string {
  return getDayDate(dischargeDate, dayNumber).toISOString().split('T')[0];
}
