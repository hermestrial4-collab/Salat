import { PrayerState, PrayerName, PRAYER_ARABIC } from '../types';
import { getRemaining } from '../utils/qadaCalculations';

interface Props {
  prayer: PrayerState;
  onIncrement: (count: number) => void;
  onUndo: () => void;
  canUndo: boolean;
}

export default function PrayerCard({ prayer, onIncrement, onUndo, canUndo }: Props) {
  const remaining = getRemaining(prayer);
  const completed = prayer.completed;
  const original = prayer.originalAmount;
  const pct = original > 0 ? Math.round((completed / original) * 100 * 100) / 100 : 0;

  return (
    <div className="prayer-card">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="font-semibold text-base">
            {prayer.name} <span className="text-[var(--color-text-muted)] font-normal text-sm">{PRAYER_ARABIC[prayer.name as PrayerName]}</span>
          </h3>
          <p className="text-xs text-[var(--color-text-muted)]">
            Original: {original.toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-[var(--color-primary)]">{remaining.toLocaleString()}</p>
          <p className="text-xs text-[var(--color-text-muted)]">remaining</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 progress-bar">
          <div className="progress-fill" style={{ width: `${Math.min(100, pct)}%` }} />
        </div>
        <span className="text-sm font-medium text-[var(--color-primary)] min-w-[4rem] text-right">
          {pct}%
        </span>
      </div>

      <p className="text-xs text-[var(--color-text-muted)] mb-3">
        Completed: {completed.toLocaleString()}
      </p>

      <div className="flex flex-wrap gap-2">
        <button className="btn-primary flex-1 min-w-[120px]" onClick={() => onIncrement(1)}>
          +1 Completed
        </button>
        <button className="btn-secondary" onClick={() => onIncrement(5)}>+5</button>
        <button className="btn-secondary" onClick={() => onIncrement(10)}>+10</button>
        <button className="btn-secondary text-[var(--color-warning)]" onClick={onUndo} disabled={!canUndo}
                style={{ opacity: canUndo ? 1 : 0.4 }}>
          Undo
        </button>
      </div>
    </div>
  );
}