import { AppData, PrayerName, PRAYER_NAMES, ALL_TRACKERS, DailyRecord } from '../types';

interface Props {
  data: AppData;
}

export default function HistoryView({ data }: Props) {
  const sorted = [...data.dailyRecords]
    .filter(r => PRAYER_NAMES.reduce((s, n) => s + (r.prayers[n] || 0), 0) > 0)
    .sort((a, b) => b.date.localeCompare(a.date));

  const getDayTotal = (r: DailyRecord) => PRAYER_NAMES.reduce((s, n) => s + (r.prayers[n] || 0), 0);

  // Streaks
  let longestStreak = 0;
  let streak = 0;
  for (const r of [...data.dailyRecords].sort((a, b) => a.date.localeCompare(b.date))) {
    if (getDayTotal(r) > 0) {
      streak++;
      longestStreak = Math.max(longestStreak, streak);
    } else {
      streak = 0;
    }
  }
  let currentStreak = 0;
  const reverse = [...data.dailyRecords].sort((a, b) => b.date.localeCompare(a.date));
  for (const r of reverse) {
    if (getDayTotal(r) > 0) currentStreak++;
    else break;
  }

  if (sorted.length === 0) {
    return (
      <div>
        <h2 className="text-lg font-bold mb-3">History</h2>
        <div className="prayer-card">
          <p className="text-sm text-[var(--color-text-muted)]">
            No Qada prayers recorded yet. Start tracking from the Dashboard or Today page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-bold mb-3">History</h2>

      <div className="flex gap-3 mb-4">
        <div className="flex-1 prayer-card text-center py-2">
          <p className="text-lg font-bold text-[var(--color-primary)]">{currentStreak}</p>
          <p className="text-xs text-[var(--color-text-muted)]">Current streak</p>
        </div>
        <div className="flex-1 prayer-card text-center py-2">
          <p className="text-lg font-bold text-[var(--color-primary)]">{longestStreak}</p>
          <p className="text-xs text-[var(--color-text-muted)]">Longest streak</p>
        </div>
        <div className="flex-1 prayer-card text-center py-2">
          <p className="text-lg font-bold text-[var(--color-primary)]">{sorted.length}</p>
          <p className="text-xs text-[var(--color-text-muted)]">Days tracked</p>
        </div>
      </div>

      <div className="space-y-2">
        {sorted.slice(0, 30).map(r => {
          const total = getDayTotal(r);
          return (
            <div key={r.date} className="prayer-card !p-3">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-sm">{r.date}</span>
                <span className="text-sm font-medium text-[var(--color-primary)]">{total} prayers</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {PRAYER_NAMES.map(p => {
                  const count = r.prayers[p] || 0;
                  if (count === 0) return null;
                  return (
                    <span key={p} className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                      {p}: {count}
                    </span>
                  );
                })}
              </div>
              {r.note && <p className="text-xs text-[var(--color-text-muted)] mt-1 italic">{r.note}</p>}
            </div>
          );
        })}
      </div>

      {sorted.length > 30 && (
        <p className="text-sm text-center text-[var(--color-text-muted)] mt-3">
          Showing last 30 days of {sorted.length} total
        </p>
      )}
    </div>
  );
}