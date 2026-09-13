import { AppData, PrayerState, DailyRecord, PrayerName, PRAYER_NAMES, ALL_TRACKERS, DEFAULT_STARTING, FASTING_STARTING } from '../types';

const STORAGE_KEY = 'qada-salah-tracker-data';
const BACKUP_KEY = 'qada-salah-tracker-backup';

function createInitialPrayer(name: PrayerName, amount: number): PrayerState {
  return { name, originalAmount: amount, completed: 0 };
}

export function getInitialData(startAmount: number = DEFAULT_STARTING): AppData {
  const prayers: Record<PrayerName, PrayerState> = {} as Record<PrayerName, PrayerState>;
  for (const name of PRAYER_NAMES) {
    prayers[name] = createInitialPrayer(name, startAmount);
  }
  prayers['Sawm'] = createInitialPrayer('Sawm', FASTING_STARTING);
  return {
    prayers,
    dailyRecords: [],
    settings: { startingAmount: startAmount, theme: 'light' },
  };
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!parsed.settings) {
        parsed.settings = { startingAmount: DEFAULT_STARTING, theme: 'light' };
      }
      if (!parsed.dailyRecords) {
        parsed.dailyRecords = [];
      }
      for (const name of ALL_TRACKERS) {
        if (!parsed.prayers[name]) {
          const amt = name === 'Sawm' ? FASTING_STARTING : parsed.settings.startingAmount;
          parsed.prayers[name] = createInitialPrayer(name, amt);
        }
      }
      return parsed;
    }
  } catch (e) {
    console.error('Failed to load data:', e);
  }
  return getInitialData();
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    localStorage.setItem(BACKUP_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data:', e);
  }
}

export function exportData(data: AppData): string {
  return JSON.stringify(data, null, 2);
}

export function importData(json: string): AppData | null {
  try {
    const parsed = JSON.parse(json);
    if (!parsed.prayers || !parsed.dailyRecords) return null;
    for (const name of ALL_TRACKERS) {
      if (!parsed.prayers[name]) return null;
      if (typeof parsed.prayers[name].completed !== 'number') return null;
    }
    if (!parsed.settings) {
      parsed.settings = { startingAmount: DEFAULT_STARTING, theme: 'light' };
    }
    return parsed as AppData;
  } catch {
    return null;
  }
}

export function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getTodayRecord(data: AppData): DailyRecord | undefined {
  const key = getTodayKey();
  return data.dailyRecords.find(r => r.date === key);
}

export function upsertTodayPrayer(data: AppData, prayer: PrayerName, count: number): AppData {
  const key = getTodayKey();
  const records = [...data.dailyRecords];
  const idx = records.findIndex(r => r.date === key);

  if (idx >= 0) {
    records[idx] = {
      ...records[idx],
      prayers: { ...records[idx].prayers, [prayer]: (records[idx].prayers[prayer] || 0) + count },
    };
  } else {
    records.push({
      date: key,
      prayers: { [prayer]: count } as Record<PrayerName, number>,
    });
  }

  return { ...data, dailyRecords: records };
}

export function setTodayGoal(data: AppData, goal: number): AppData {
  const key = getTodayKey();
  const records = [...data.dailyRecords];
  const idx = records.findIndex(r => r.date === key);

  if (idx >= 0) {
    records[idx] = { ...records[idx], goal };
  } else {
    records.push({
      date: key,
      prayers: {} as Record<PrayerName, number>,
      goal,
    });
  }

  return { ...data, dailyRecords: records };
}

export function setTodayNote(data: AppData, note: string): AppData {
  const key = getTodayKey();
  const records = [...data.dailyRecords];
  const idx = records.findIndex(r => r.date === key);

  if (idx >= 0) {
    records[idx] = { ...records[idx], note };
  } else {
    records.push({
      date: key,
      prayers: {} as Record<PrayerName, number>,
      note,
    });
  }

  return { ...data, dailyRecords: records };
}

export function getRemaining(prayer: PrayerState): number {
  return Math.max(0, prayer.originalAmount - prayer.completed);
}

export function getTotalCompleted(data: AppData): number {
  return ALL_TRACKERS.reduce((sum, n) => sum + data.prayers[n].completed, 0);
}

export function getTotalCompletedPrayersOnly(data: AppData): number {
  return PRAYER_NAMES.reduce((sum, n) => sum + data.prayers[n].completed, 0);
}

export function getTotalRemaining(data: AppData): number {
  return ALL_TRACKERS.reduce((sum, n) => sum + getRemaining(data.prayers[n]), 0);
}

export function getTotalOriginal(data: AppData): number {
  return ALL_TRACKERS.reduce((sum, n) => sum + data.prayers[n].originalAmount, 0);
}

export function getOverallPercent(data: AppData): number {
  const total = getTotalOriginal(data);
  if (total === 0) return 0;
  return Math.round((getTotalCompleted(data) / total) * 100 * 100) / 100;
}

export function getDaysRemaining(data: AppData): number {
  const completed = PRAYER_NAMES.map(n => data.prayers[n].completed);
  const minCompleted = Math.min(...completed);
  return Math.max(0, data.settings.startingAmount - minCompleted);
}

export function getDaysCompleted(data: AppData): number {
  const completed = PRAYER_NAMES.map(n => data.prayers[n].completed);
  return Math.min(...completed);
}

export function getAveragePerDay(data: AppData): number {
  const records = data.dailyRecords;
  if (records.length === 0) return 0;
  const activeDays = records.filter(r => {
    const total = ALL_TRACKERS.reduce((s, n) => s + (r.prayers[n] || 0), 0);
    return total > 0;
  });
  if (activeDays.length === 0) return 0;
  const totalPrayers = activeDays.reduce((sum, r) =>
    sum + ALL_TRACKERS.reduce((s, n) => s + (r.prayers[n] || 0), 0), 0);
  return Math.round((totalPrayers / activeDays.length) * 100) / 100;
}

export function getProjection(daysRemaining: number, dailyPace: number): number {
  if (dailyPace <= 0) return Infinity;
  return daysRemaining / dailyPace;
}

export function getStreaks(data: AppData): { current: number; longest: number } {
  const records = [...data.dailyRecords].sort((a, b) => a.date.localeCompare(b.date));

  let longest = 0;
  let streak = 0;

  for (const r of records) {
    const total = ALL_TRACKERS.reduce((s, n) => s + (r.prayers[n] || 0), 0);
    if (total > 0) {
      streak++;
      longest = Math.max(longest, streak);
    } else {
      streak = 0;
    }
  }

  let current = 0;
  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date));

  if (sorted.length > 0) {
    const mostRecent = sorted[0];
    const recentTotal = ALL_TRACKERS.reduce((s, n) => s + (mostRecent.prayers[n] || 0), 0);
    if (recentTotal === 0) {
      return { current: 0, longest };
    }
  }

  for (const r of sorted) {
    const total = ALL_TRACKERS.reduce((s, n) => s + (r.prayers[n] || 0), 0);
    if (total > 0) {
      current++;
    } else {
      break;
    }
  }

  return { current, longest };
}

export function getDateRange(date: string): { week: string; month: string } {
  const d = new Date(date + 'T00:00:00');
  const day = d.getDay();
  const diff = d.getDate() - day;
  const monday = new Date(d);
  monday.setDate(diff);
  const week = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
  const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  return { week, month };
}

export function getWeeklyTotals(data: AppData): { week: string; total: number }[] {
  const weeks: Record<string, number> = {};
  for (const r of data.dailyRecords) {
    const { week } = getDateRange(r.date);
    const total = ALL_TRACKERS.reduce((s, n) => s + (r.prayers[n] || 0), 0);
    weeks[week] = (weeks[week] || 0) + total;
  }
  return Object.entries(weeks)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, total]) => ({ week, total }));
}

export function getMonthlyTotals(data: AppData): { month: string; total: number }[] {
  const months: Record<string, number> = {};
  for (const r of data.dailyRecords) {
    const { month } = getDateRange(r.date);
    const total = ALL_TRACKERS.reduce((s, n) => s + (r.prayers[n] || 0), 0);
    months[month] = (months[month] || 0) + total;
  }
  return Object.entries(months)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, total]) => ({ month, total }));
}

export const MILESTONES = [
  { percent: 1, label: '1% completed — a blessed start.' },
  { percent: 5, label: '5% completed — every prayer counts.' },
  { percent: 10, label: '10% completed — beautiful progress.' },
  { percent: 25, label: '25% completed — SubhanAllah, keep going.' },
  { percent: 50, label: '50% completed — half way, Alhamdulillah!' },
  { percent: 75, label: '75% completed — the home stretch.' },
  { percent: 90, label: '90% completed — almost there.' },
  { percent: 100, label: '100% completed — Allahu Akbar! All Qada complete.' },
];

export function getMilestonesReached(data: AppData, previouslyReached: number[]): { reached: number[]; newMessages: string[] } {
  const pct = getOverallPercent(data);
  const reached = [...previouslyReached];
  const newMessages: string[] = [];

  for (const m of MILESTONES) {
    if (pct >= m.percent && !reached.includes(m.percent)) {
      reached.push(m.percent);
      newMessages.push(`Alhamdulillah — ${m.label}`);
    }
  }

  return { reached, newMessages };
}

export function getFastingRemaining(data: AppData): number {
  return getRemaining(data.prayers['Sawm']);
}
export function getFastingCompleted(data: AppData): number {
  return data.prayers['Sawm'].completed;
}