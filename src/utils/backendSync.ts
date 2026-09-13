const BACKEND_URL = 'http://localhost:3001';

export async function syncLoadFromBackend(): Promise<any | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/data`);
    if (res.ok) return await res.json();
  } catch {}
  return null;
}

export async function syncSaveToBackend(data: any): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function syncExportBackend(): Promise<void> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/export`);
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'qada-backup.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  } catch {}
}

export async function syncImportBackend(json: string): Promise<boolean> {
  try {
    const parsed = JSON.parse(json);
    const res = await fetch(`${BACKEND_URL}/api/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed),
    });
    return res.ok;
  } catch {
    return false;
  }
}