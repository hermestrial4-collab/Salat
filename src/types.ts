export type PrayerName = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha' | 'Witr';

export interface PrayerState {
  name: PrayerName;
  originalAmount: number;
  completed: number;
}

export interface DailyRecord {
  date: string; // YYYY-MM-DD
  prayers: Record<PrayerName, number>; // how many of each completed on this day
  note?: string;
  goal?: number;
}

export interface AppData {
  prayers: Record<PrayerName, PrayerState>;
  dailyRecords: DailyRecord[];
  settings: AppSettings;
}

export interface AppSettings {
  startingAmount: number;
  theme: 'light' | 'dark';
}

export const DEFAULT_STARTING = 3562;
export const PRAYER_NAMES: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha', 'Witr'];
export const TOTAL_ORIGINAL = DEFAULT_STARTING * 6;

// Arabic names for display
export const PRAYER_ARABIC: Record<PrayerName, string> = {
  Fajr: 'الفجر',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء',
  Witr: 'الوتر',
};

export const PRAYER_TIMES: Record<PrayerName, string> = {
  Fajr: 'Dawn',
  Dhuhr: 'Noon',
  Asr: 'Afternoon',
  Maghrib: 'Sunset',
  Isha: 'Night',
  Witr: 'Odd (after Isha)',
};