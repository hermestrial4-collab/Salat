import { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppData, PrayerName, PRAYER_NAMES, DEFAULT_STARTING, TOTAL_ORIGINAL } from './types';
import { 
  loadData, saveData, exportData, importData, 
  getTotalCompleted, getTotalRemaining, getOverallPercent, 
  getDaysRemaining, getStreaks, getMilestonesReached,
  getTodayKey, upsertTodayPrayer, setTodayGoal, setTodayNote
} from './utils/qadaCalculations';
import Navigation from './components/Navigation';
import OverallProgress from './components/OverallProgress';
import PrayerCard from './components/PrayerCard';
import TodayTracker from './components/TodayTracker';
import DailyGoal from './components/DailyGoal';
import HistoryView from './components/HistoryView';
import StatisticsPage from './components/StatisticsPage';
import Settings from './components/Settings';

function DashboardPage({ data, onIncrement, onUndo, undoStates, onTodayCheck, onSetGoal }: any) {
  const daysRemaining = getDaysRemaining(data);
  const totalPct = getOverallPercent(data);

  return (
    <div className="pb-24">
      <h1 className="text-xl font-bold mb-4">Qada Salah Tracker</h1>
      
      <OverallProgress data={data} />

      <div className="prayer-card mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">Days of Qada Remaining</p>
            <p className="text-xs text-[var(--color-text-muted)]">
              Based on the lowest completed prayer
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[var(--color-primary)]">{daysRemaining.toLocaleString()}</p>
            <p className="text-xs text-[var(--color-text-muted)]">
              ≈ {Math.floor(daysRemaining / 30)} months
            </p>
          </div>
        </div>
      </div>

      <DailyGoal data={data} />

      <h2 className="font-bold text-lg mt-4 mb-3">Prayers</h2>
      <div className="space-y-3">
        {PRAYER_NAMES.map(name => (
          <PrayerCard
            key={name}
            prayer={data.prayers[name]}
            onIncrement={(count) => onIncrement(name, count)}
            onUndo={() => onUndo(name)}
            canUndo={undoStates[name]?.length > 0}
          />
        ))}
      </div>
    </div>
  );
}

function App() {
  const [data, setData] = useState<AppData>(() => loadData());
  const [milestones, setMilestones] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('qada-milestones');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [theme, setTheme] = useState<'light' | 'dark'>(() => data.settings?.theme || 'light');
  const [undoStates, setUndoStates] = useState<Record<PrayerName, number[]>>(() => {
    const saved = localStorage.getItem('qada-undo');
    return saved ? JSON.parse(saved) : {};
  });

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Save data on changes
  useEffect(() => {
    saveData(data);
    // Check milestones
    const { reached, newMessages } = getMilestonesReached(data, milestones);
    if (reached.length > milestones.length) {
      setMilestones(reached);
      localStorage.setItem('qada-milestones', JSON.stringify(reached));
      // Show milestone messages
      for (const msg of newMessages) {
        setTimeout(() => alert(msg), 100);
      }
    }
  }, [data]);

  // Save undo states
  useEffect(() => {
    localStorage.setItem('qada-undo', JSON.stringify(undoStates));
  }, [undoStates]);

  const handleIncrement = useCallback((prayer: PrayerName, count: number) => {
    setData(prev => {
      const p = prev.prayers[prayer];
      const remaining = p.originalAmount - p.completed;
      const actualCount = Math.min(count, remaining);
      if (actualCount <= 0) return prev;

      // Save undo state
      setUndoStates(u => ({
        ...u,
        [prayer]: [...(u[prayer] || []), actualCount],
      }));

      // Update prayer
      const newPrayers = { ...prev.prayers };
      newPrayers[prayer] = {
        ...newPrayers[prayer],
        completed: newPrayers[prayer].completed + actualCount,
      };

      // Update daily record
      const newData = upsertTodayPrayer({ ...prev, prayers: newPrayers }, prayer, actualCount);
      
      return newData;
    });
  }, []);

  const handleUndo = useCallback((prayer: PrayerName) => {
    setData(prev => {
      const states = undoStates[prayer];
      if (!states || states.length === 0) return prev;
      const last = states[states.length - 1];
      
      setUndoStates(u => ({
        ...u,
        [prayer]: u[prayer].slice(0, -1),
      }));

      const newPrayers = { ...prev.prayers };
      newPrayers[prayer] = {
        ...newPrayers[prayer],
        completed: Math.max(0, newPrayers[prayer].completed - last),
      };

      return { ...prev, prayers: newPrayers };
    });
  }, [undoStates]);

  const handleTodayCheck = useCallback((prayer: PrayerName) => {
    // Check if already done today
    const todayKey = getTodayKey();
    const today = data.dailyRecords.find(r => r.date === todayKey);
    if (today && (today.prayers[prayer] || 0) > 0) return; // Already checked

    handleIncrement(prayer, 1);
  }, [data, handleIncrement]);

  const handleSetGoal = useCallback((goal: number) => {
    setData(prev => setTodayGoal(prev, goal));
  }, []);

  const handleSetNote = useCallback((note: string) => {
    setData(prev => setTodayNote(prev, note));
  }, []);

  const handleToggleTheme = useCallback(() => {
    setTheme(t => {
      const next = t === 'light' ? 'dark' : 'light';
      setData(prev => ({ ...prev, settings: { ...prev.settings, theme: next } }));
      return next;
    });
  }, []);

  const handleResetAll = useCallback(() => {
    setData({
      prayers: (() => {
        const p: any = {};
        for (const name of PRAYER_NAMES) {
          p[name] = { name, originalAmount: data.settings.startingAmount, completed: 0 };
        }
        return p;
      })(),
      dailyRecords: [],
      settings: { ...data.settings, theme },
    });
    setUndoStates({} as Record<PrayerName, number[]>);
    setMilestones([]);
    localStorage.setItem('qada-milestones', '[]');
  }, [data.settings.startingAmount, theme]);

  const handleUpdateData = useCallback((newData: AppData) => {
    setData({ ...newData, settings: { ...newData.settings, theme } });
  }, [theme]);

  return (
    <BrowserRouter>
      <div className="max-w-lg mx-auto px-4 pt-4 pb-20 min-h-screen">
        <Routes>
          <Route path="/" element={
            <DashboardPage 
              data={data} 
              onIncrement={handleIncrement}
              onUndo={handleUndo}
              undoStates={undoStates}
              onTodayCheck={handleTodayCheck}
              onSetGoal={handleSetGoal}
            />
          } />
          <Route path="/today" element={
            <div className="pb-24">
              <h1 className="text-xl font-bold mb-4">Today's Qada</h1>
              <TodayTracker data={data} onCheckPrayer={handleTodayCheck} onSetGoal={handleSetGoal} />
              <div className="mt-3 prayer-card">
                <h3 className="font-semibold text-sm mb-1">Today's Note</h3>
                <input
                  type="text"
                  placeholder="e.g., Completed two full days after Isha"
                  defaultValue={data.dailyRecords.find(r => r.date === getTodayKey())?.note || ''}
                  onBlur={e => handleSetNote(e.target.value)}
                  className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 bg-[var(--color-bg)] text-[var(--color-text)] text-sm"
                />
              </div>
              <DailyGoal data={data} />
            </div>
          } />
          <Route path="/history" element={
            <div className="pb-24"><HistoryView data={data} /></div>
          } />
          <Route path="/stats" element={
            <div className="pb-24"><StatisticsPage data={data} /></div>
          } />
          <Route path="/settings" element={
            <div className="pb-24">
              <Settings 
                data={data} 
                onUpdateData={handleUpdateData}
                onResetAll={handleResetAll}
                onToggleTheme={handleToggleTheme}
                theme={theme}
              />
            </div>
          } />
        </Routes>
      </div>
      <Navigation />
    </BrowserRouter>
  );
}

export default App;