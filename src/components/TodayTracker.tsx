import { PrayerName, PRAYER_NAMES, ALL_TRACKERS } from '../types';
import { getTodayRecord, getTodayKey } from '../utils/qadaCalculations';
import { AppData } from '../types';

interface Props {
  data: AppData;
  onCheckPrayer: (prayer: PrayerName) => void;
  onSetGoal: (goal: number) => void;
}

export default function TodayTracker({ data, onCheckPrayer, onSetGoal }: Props) {
  const today = getTodayRecord(data);
  const goal = data.dailyRecords.find(r => r.date === getTodayKey())?.goal;

  const isPrayerCompleted = (p: PrayerName): boolean => {
    return today ? (today.prayers[p] || 0) > 0 : false;
  };

  const totalToday = ALL_TRACKERS.reduce((s, n) => s + (today?.prayers[n] || 0), 0);

  return (
    <div className="prayer-card">
      <h2 className="text-lg font-bold mb-3">Today's Qada</h2>

      {/* 6 Prayers */}
      <div className="space-y-2 mb-3">
        {PRAYER_NAMES.map(p => {
          const done = isPrayerCompleted(p);
          return (
            <div key={p} className="flex items-center gap-3 py-1">
              <button
                onClick={() => onCheckPrayer(p)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all
                  ${done ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white' : 'border-[var(--color-border)] hover:border-[var(--color-primary)]'}`}
              >
                {done ? '✓' : ''}
              </button>
              <span className={`flex-1 ${done ? 'line-through text-[var(--color-text-muted)]' : 'font-medium'}`}>
                {p}
              </span>
              {done && <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-success)]/10 text-[var(--color-success)]">Done</span>}
            </div>
          );
        })}
      </div>

      {/* Sawm separator */}
      <div className="border-t border-[var(--color-border)] pt-3 mb-3">
        <div className="flex items-center gap-3 py-1">
          <button
            onClick={() => onCheckPrayer('Sawm')}
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all
              ${isPrayerCompleted('Sawm') ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white' : 'border-[var(--color-border)] hover:border-[var(--color-primary)]'}`}
          >
            {isPrayerCompleted('Sawm') ? '✓' : ''}
          </button>
          <span className={`flex-1 ${isPrayerCompleted('Sawm') ? 'line-through text-[var(--color-text-muted)]' : 'font-medium'}`}>
            Sawm (Fasting)
          </span>
          {isPrayerCompleted('Sawm') && <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-success)]/10 text-[var(--color-success)]">Done</span>}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 progress-bar">
          <div className="progress-fill" style={{ width: `${Math.min(100, (totalToday / ALL_TRACKERS.length) * 100)}%` }} />
        </div>
        <span className="text-sm font-medium">{totalToday}/{ALL_TRACKERS.length}</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {[1, 2, 3, 4].map(n => (
          <button key={n} onClick={() => onSetGoal(n * 6)}
            className={`btn-secondary text-xs px-3 py-1 ${goal === n * 6 ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : ''}`}>
            {n} day{n > 1 ? 's' : ''} ({n * 6})
          </button>
        ))}
        {goal && goal > 24 && (
          <button onClick={() => onSetGoal(goal)}
            className="btn-secondary text-xs px-3 py-1 bg-[var(--color-primary)] text-white border-[var(--color-primary)]">
            Custom: {goal}
          </button>
        )}
        {goal && (
          <button onClick={() => onSetGoal(0)} className="btn-secondary text-xs px-3 py-1">Clear</button>
        )}
      </div>

      {goal && goal > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex-1 progress-bar">
            <div className="progress-fill" style={{ width: `${Math.min(100, (totalToday / goal) * 100)}%` }} />
          </div>
          <span className="text-sm font-medium text-[var(--color-primary)]">{Math.min(totalToday, goal)}/{goal}</span>
        </div>
      )}
    </div>
  );
}