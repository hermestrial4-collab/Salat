import { useState } from 'react';
import { AppData, DEFAULT_STARTING, PRAYER_NAMES } from '../types';
import { exportData, importData } from '../utils/qadaCalculations';

interface Props {
  data: AppData;
  onUpdateData: (data: AppData) => void;
  onResetAll: () => void;
  onToggleTheme: () => void;
  theme: 'light' | 'dark';
}

export default function Settings({ data, onUpdateData, onResetAll, onToggleTheme, theme }: Props) {
  const [resetConfirm, setResetConfirm] = useState(false);
  const [resetText, setResetText] = useState('');
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState('');
  const [editAmount, setEditAmount] = useState(data.settings.startingAmount);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState('');

  const handleExport = () => {
    const json = exportData(data);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qada-salah-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage('Backup exported!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleImport = () => {
    const result = importData(importText);
    if (result) {
      onUpdateData(result);
      setImportStatus('Import successful!');
      setImportText('');
      setTimeout(() => setImportStatus(''), 3000);
    } else {
      setImportStatus('Invalid backup file. Please check the JSON format.');
    }
  };

  const handleResetConfirm = () => {
    if (!resetConfirm) {
      setResetConfirm(true);
      return;
    }
    if (resetText === 'RESET') {
      onResetAll();
      setResetConfirm(false);
      setResetText('');
      setMessage('All data has been reset.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleUpdateStartingAmount = () => {
    const amt = parseInt(editAmount.toString());
    if (isNaN(amt) || amt < 0) return;
    
    // Update all prayers
    const updated = { ...data, prayers: { ...data.prayers } };
    for (const name of PRAYER_NAMES) {
      const completed = updated.prayers[name].completed;
      updated.prayers[name] = {
        ...updated.prayers[name],
        originalAmount: amt,
      };
    }
    updated.settings = { ...updated.settings, startingAmount: amt };
    onUpdateData(updated);
    setEditMode(false);
    setMessage('Starting amounts updated.');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div>
      <h2 className="text-lg font-bold mb-3">Settings</h2>

      {message && (
        <div className="prayer-card mb-3 bg-[var(--color-success)]/5 border-[var(--color-success)]">
          <p className="text-sm font-medium text-[var(--color-success)]">{message}</p>
        </div>
      )}

      <div className="space-y-3">
        {/* Theme */}
        <div className="prayer-card">
          <h3 className="font-semibold mb-2">Appearance</h3>
          <button onClick={onToggleTheme} className="btn-secondary">
            {theme === 'light' ? '🌙 Switch to Dark Mode' : '☀️ Switch to Light Mode'}
          </button>
        </div>

        {/* Starting Amount */}
        <div className="prayer-card">
          <h3 className="font-semibold mb-2">Starting Balance per Prayer</h3>
          <p className="text-sm text-[var(--color-text-muted)] mb-2">
            Current: {data.settings.startingAmount.toLocaleString()}
          </p>
          {editMode ? (
            <div className="flex gap-2">
              <input
                type="number"
                value={editAmount}
                onChange={e => setEditAmount(parseInt(e.target.value) || 0)}
                className="flex-1 border border-[var(--color-border)] rounded-lg px-3 py-2 bg-[var(--color-bg)] text-[var(--color-text)]"
              />
              <button onClick={handleUpdateStartingAmount} className="btn-primary">Save</button>
              <button onClick={() => setEditMode(false)} className="btn-secondary">Cancel</button>
            </div>
          ) : (
            <button onClick={() => { setEditAmount(data.settings.startingAmount); setEditMode(true); }} className="btn-secondary">
              Change Starting Amount
            </button>
          )}
        </div>

        {/* Backup */}
        <div className="prayer-card">
          <h3 className="font-semibold mb-2">Backup</h3>
          <p className="text-sm text-[var(--color-text-muted)] mb-2">
            Export your data to a JSON file for safekeeping, or restore from a previous backup.
          </p>
          <div className="flex gap-2 mb-2">
            <button onClick={handleExport} className="btn-secondary">📥 Export Backup</button>
          </div>
          <div className="mb-2">
            <textarea
              placeholder="Paste backup JSON here to restore..."
              value={importText}
              onChange={e => setImportText(e.target.value)}
              className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 bg-[var(--color-bg)] text-[var(--color-text)] text-sm h-20"
            />
          </div>
          <button onClick={handleImport} className="btn-secondary" disabled={!importText}
            style={{ opacity: importText ? 1 : 0.4 }}>
            📥 Restore from Backup
          </button>
          {importStatus && (
            <p className={`text-sm mt-1 ${importStatus.includes('success') ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
              {importStatus}
            </p>
          )}
        </div>

        {/* Reset */}
        <div className="prayer-card border-[var(--color-danger)]/30">
          <h3 className="font-semibold mb-2 text-[var(--color-danger)]">Reset All Progress</h3>
          <p className="text-sm text-[var(--color-text-muted)] mb-2">
            This will reset all completed prayers back to zero. Your starting amounts will remain.
          </p>
          
          {!resetConfirm ? (
            <button onClick={() => setResetConfirm(true)} className="btn-secondary text-[var(--color-danger)] border-[var(--color-danger)]/50">
              Reset All Progress
            </button>
          ) : (
            <div>
              <p className="text-sm font-bold text-[var(--color-danger)] mb-1">
                ⚠️ Warning: This cannot be undone. All progress will be lost.
              </p>
              <p className="text-sm text-[var(--color-text-muted)] mb-2">
                Type <span className="font-bold">RESET</span> to confirm.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={resetText}
                  onChange={e => setResetText(e.target.value)}
                  placeholder="Type RESET..."
                  className="flex-1 border border-[var(--color-danger)] rounded-lg px-3 py-2 bg-[var(--color-bg)] text-[var(--color-text)]"
                />
                <button onClick={handleResetConfirm} className="btn-primary bg-[var(--color-danger)] text-white"
                  disabled={resetText !== 'RESET'}
                  style={{ opacity: resetText === 'RESET' ? 1 : 0.4 }}>
                  Confirm Reset
                </button>
                <button onClick={() => { setResetConfirm(false); setResetText(''); }} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}