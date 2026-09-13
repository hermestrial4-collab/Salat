import { useMemo } from 'react';
import { AppData } from '../types';
import { getDaysRemaining, getProjection, getAveragePerDay, getTotalCompleted, getTotalOriginal, getOverallPercent } from '../utils/qadaCalculations';

interface Props {
  data: AppData;
}

export default function DailyGoal({ data }: Props) {
  const daysRemaining = getDaysRemaining(data);
  const avgPerDay = getAveragePerDay(data);
  const totalPct = getOverallPercent(data);
  const totalCompleted = getTotalCompleted(data);
  const totalOriginal = getTotalOriginal(data);
  
  // Projections
  const years1 = useMemo(() => {
    if (daysRemaining <= 0) return 0;
    return daysRemaining / 365;
  }, [daysRemaining]);

  const projections = useMemo(() => {
    if (daysRemaining <= 0) return null;
    return [
      { label: '1 prayer day/day (6 prayers)', years: daysRemaining / 365 },
      { label: '2 prayer days/day (12 prayers)', years: daysRemaining / 365 / 2 },
      { label: '3 prayer days/day (18 prayers)', years: daysRemaining / 365 / 3 },
      { label: '4 prayer days/day (24 prayers)', years: daysRemaining / 365 / 4 },
    ];
  }, [daysRemaining]);

  if (totalCompleted === 0) {
    return (
      <div className="prayer-card">
        <h2 className="text-lg font-bold mb-2">Completion Projections</h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          Complete your first Qada prayers to see projections.
        </p>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          Approximately {daysRemaining.toLocaleString()} full prayer days remaining.
        </p>
      </div>
    );
  }

  return (
    <div className="prayer-card">
      <h2 className="text-lg font-bold mb-3">Completion Projections</h2>
      
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="text-center p-2 rounded-lg bg-[var(--color-bg)]">
          <p className="text-lg font-bold text-[var(--color-primary)]">
            {daysRemaining.toLocaleString()}
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">Prayer days remaining</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-[var(--color-bg)]">
          <p className="text-lg font-bold text-[var(--color-primary)]">
            {avgPerDay > 0 ? avgPerDay.toFixed(1) : '-'}
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">Avg prayers/day</p>
        </div>
      </div>

      <div className="text-sm font-medium mb-2">Projected completion:</div>
      <div className="space-y-1.5">
        {projections?.map((p, i) => (
          <div key={i} className="flex justify-between text-sm py-0.5">
            <span className="text-[var(--color-text-muted)]">{p.label}</span>
            <span className="font-semibold">
              {p.years < 1 ? `${Math.round(p.years * 12)} months` : `${p.years.toFixed(2)} years`}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-2 border-t border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
        <p>Completed: {totalCompleted.toLocaleString()} / {totalOriginal.toLocaleString()} ({totalPct}%)</p>
      </div>
    </div>
  );
}