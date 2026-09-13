import { useLocation, Link } from 'react-router-dom';

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
                    flex justify-around items-center px-2 pb-2 pt-1">
      {tabs.map(tab => {
        const isActive = location.pathname === tab.path;
        return (
          <Link
            key={tab.path}
            to={tab.path}
            className={`nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}