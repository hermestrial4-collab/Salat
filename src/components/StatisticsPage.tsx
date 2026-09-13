import { AppData, PrayerName, PRAYER_NAMES } from '../types';
import { 
  getTotalCompleted, getTotalRemaining, getOverallPercent, 
  getAveragePerDay, getStreaks, getWeeklyTotals, getMonthlyTotals,
  getDaysCompleted, getDaysRemaining
} from '../utils/qadaCalculations';

interface Props {
  data: AppData;
}

export default function StatisticsPage({ data }: Props) {
  const totalCompleted = getTotalCompleted(data);
  const totalRemaining = getTotalRemaining(data);
  const avgPerDay = getAveragePerDay(data);
  const { current: curStreak, longest: longStreak } = getStreaks(data);
  const pct = getOverallPercent(data);
  const daysDone = getDaysCompleted(data);
  const daysLeft = getDaysRemaining(data);

  const weeklyTotals = getWeeklyTotals(data);
  const monthlyTotals = getMonthlyTotals(data);

  // Find most productive day
  let mostProductive = { date: '', total: 0 };
  for (const r of data.dailyRecords) {
    const total = PRAYER_NAMES.reduce((s, n) => s + (r.prayers[n] || 0), 0);
    if (total > mostProductive.total) {
      mostProductive = { date: r.date, total };
    }
  }

  // Completion percentage by prayer
  const prayerPcts = PRAYER_NAMES.map(n => {
    const p = data.prayers[n];
    const pct = p.originalAmount > 0 ? (p.completed / p.originalAmount) * 100 : 0;
    return { name: n, pct: Math.round(pct * 100) / 100, completed: p.completed, remaining: Math.max(0, p.originalAmount - p.completed) };
  });

  return (
    <div>
      <h2 className="text-lg font-bold mb-3">Statistics</h2>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="prayer-card text-center py-3">
          <p className="text-2xl font-bold text-[var(--color-primary)]">{totalCompleted.toLocaleString()}</p>
          <p className="text-xs text-[var(--color-text-muted)]">Total Completed</p>
        </div>
        <div className="prayer-card text-center py-3">
          <p className="text-2xl font-bold text-[var(--color-warning)]">{totalRemaining.toLocaleString()}</p>
          <p className="text-xs text-[var(--color-text-muted)]">Remaining</p>
        </div>
        <div className="prayer-card text-center py-3">
          <p className="text-lg font-bold text-[var(--color-primary)]">{avgPerDay > 0 ? avgPerDay.toFixed(2) : '-'}</p>
          <p className="text-xs text-[var(--color-text-muted)]">Avg prayers/day</p>
        </div>
        <div className="prayer-card text-center py-3">
          <p className="text-lg font-bold text-[var(--color-primary)]">{daysDone.toLocaleString()}</p>
          <p className="text-xs text-[var(--color-text-muted)]">Full prayer days done</p>
        </div>
        <div className="prayer-card text-center py-3">
          <p className="text-lg font-bold text-[var(--color-primary)]">{curStreak}</p>
          <p className="text-xs text-[var(--color-text-muted)]">Current streak (days)</p>
        </div>
        <div className="prayer-card text-center py-3">
          <p className="text-lg font-bold text-[var(--color-primary)]">{longStreak}</p>
          <p className="text-xs text-[var(--color-text-muted)]">Longest streak (days)</p>
        </div>
      </div>

      {mostProductive.total > 0 && (
        <div className="prayer-card mb-3">
          <p className="text-sm"><span className="font-semibold">Most productive day:</span> {mostProductive.date} — {mostProductive.total} prayers</p>
        </div>
      )}

      <h3 className="font-semibold mb-2">Completion by Prayer</h3>
      <div className="space-y-2 mb-4">
        {prayerPcts.map(({ name, pct, completed, remaining }) => (
          <div key={name} className="prayer-card !p-2">
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-sm">{name}</span>
              <span className="text-sm font-bold text-[var(--color-primary)]">{pct}%</span>
            </div>
            <div className="progress-bar mb-1">
              <div className="progress-fill" style={{ width: `${Math.min(100, pct)}%` }} />
            </div>
            <div className="flex justify-between text-xs text-[var(--color-text-muted)]">
              <span>{completed.toLocaleString()} done</span>
              <span>{remaining.toLocaleString()} remaining</span>
            </div>
          </div>
        ))}
      </div>

      <h3 className="font-semibold mb-2">Weekly Progress</h3>
      {weeklyTotals.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)] mb-4">No data yet.</p>
      ) : (
        <div className="space-y-1 mb-4">
          {weeklyTotals.slice(-12).map(({ week, total }) => (
            <div key={week} className="flex items-center gap-2 text-sm">
              <span className="w-24 text-xs text-[var(--color-text-muted)]">{week}</span>
              <div className="flex-1 progress-bar">
                <div className="progress-fill" style={{ width: `${Math.min(100, (total / 42) * 100)}%` }} />
              </div>
              <span className="text-xs font-medium w-8 text-right">{total}</span>
            </div>
          ))}
        </div>
      )}

      <h3 className="font-semibold mb-2">Monthly Progress</h3>
      {monthlyTotals.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)] mb-4">No data yet.</p>
      ) : (
        <div className="space-y-1 mb-4">
          {monthlyTotals.slice(-12).map(({ month, total }) => (
            <div key={month} className="flex items-center gap-2 text-sm">
              <span className="w-24 text-xs text-[var(--color-text-muted)]">{month}</span>
              <div className="flex-1 progress-bar">
                <div className="progress-fill" style={{ width: `${Math.min(100, (total / 180) * 100)}%` }} />
              </div>
              <span className="text-xs font-medium w-8 text-right">{total}</span>
            </div>
          ))}
        </div>
      )}

      <div className="prayer-card text-sm">
        <span className="font-semibold">Estimated completion:</span>{' '}
        <span className="text-[var(--color-text-muted)]">
          {daysLeft <= 0 ? 'All Qada completed, Alhamdulillah!' : 
           avgPerDay > 0 ? 
             `${(daysLeft / avgPerDay / 365).toFixed(1)} years at current pace` :
             'Complete prayers to get an estimate'}
        </span>
      </div>
    </div>
  );
}