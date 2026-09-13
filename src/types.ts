export type PrayerName = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha' | 'Witr' | 'Sawm';

export interface PrayerState {
  name: PrayerName;
  originalAmount: number;
  completed: number;
}

export interface DailyRecord {
  date: string; // YYYY-MM-DD
  prayers: Record<PrayerName, number>;
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
export const FASTING_STARTING = 360;
export const PRAYER_NAMES: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha', 'Witr'];
export const ALL_TRACKERS: PrayerName[] = [...PRAYER_NAMES, 'Sawm'];
export const TOTAL_ORIGINAL = DEFAULT_STARTING * 6;
export const TOTAL_ORIGINAL_FASTING = FASTING_STARTING;

// Arabic names for display
export const PRAYER_ARABIC: Record<PrayerName, string> = {
  Fajr: 'الفجر',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء',
  Witr: 'الوتر',
  Sawm: 'الصوم',
};

export const PRAYER_TIMES: Record<PrayerName, string> = {
  Fajr: 'Dawn',
  Dhuhr: 'Noon',
  Asr: 'Afternoon',
  Maghrib: 'Sunset',
  Isha: 'Night',
  Witr: 'Odd (after Isha)',
  Sawm: 'Fasting (Ramadan)',
};