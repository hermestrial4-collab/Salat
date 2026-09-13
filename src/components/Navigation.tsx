import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const tabs = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/today', label: 'Today', icon: '☾' },
  { path: '/history', label: 'History', icon: '📜' },
  { path: '/stats', label: 'Stats', icon: '📈' },
  { path: '/settings', label: 'Settings', icon: '⚙' },
];

export default function Navigation() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-bg-card)] border-t border-[var(--color-border)] 
                    flex justify-around items-center px-2 pb-2 pt-1 safe-area-bottom">
      {tabs.map(tab => {
        const isActive = location.pathname === tab.path;
        return (
          <a
            key={tab.path}
            href={tab.path}
            className={`nav-link ${isActive ? 'active' : ''}`}
            onClick={e => {
              if (window.location.pathname !== tab.path) {
                // Let the router handle it
              }
            }}
          >
            <span className="text-lg">{tab.icon}</span>
            <span>{tab.label}</span>
          </a>
        );
      })}
    </nav>
  );
}