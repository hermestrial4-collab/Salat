import { AppData } from '../types';
import { getTotalCompleted, getTotalRemaining, getTotalOriginal, getOverallPercent, getFastingCompleted, getFastingRemaining } from '../utils/qadaCalculations';

interface Props {
  data: AppData;
}

export default function OverallProgress({ data }: Props) {
  const totalCompleted = getTotalCompleted(data);
  const totalRemaining = getTotalRemaining(data);
  const totalOriginal = getTotalOriginal(data);
  const pct = getOverallPercent(data);
  const fastingDone = getFastingCompleted(data);
  const fastingLeft = getFastingRemaining(data);

  return (
    <div className="prayer-card mb-4">
      <h2 className="text-lg font-bold text-center mb-3">Qada Salah &amp; Fasting Progress</h2>

      <div className="grid grid-cols-3 gap-4 mb-3 text-center">
        <div>
          <p className="text-2xl font-bold text-[var(--color-primary)]">{totalOriginal.toLocaleString()}</p>
          <p className="text-xs text-[var(--color-text-muted)]">Original Total</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-[var(--color-success)]">{totalCompleted.toLocaleString()}</p>
          <p className="text-xs text-[var(--color-text-muted)]">Completed</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-[var(--color-warning)]">{totalRemaining.toLocaleString()}</p>
          <p className="text-xs text-[var(--color-text-muted)]">Remaining</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm font-medium">Overall progress</span>
        <span className="text-sm font-bold text-[var(--color-primary)]">{pct}%</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${Math.min(100, pct)}%` }} />
      </div>

      <div className="mt-2 pt-2 border-t border-[var(--color-border)]">
        <div className="flex justify-between text-sm">
          <span>Fasting (Ṣawm)</span>
          <span className="font-medium text-[var(--color-primary)]">{fastingDone} / {fastingDone + fastingLeft}</span>
        </div>
      </div>
    </div>
  );
}