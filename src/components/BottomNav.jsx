import { NavLink } from 'react-router-dom';
import './BottomNav.css';

const tabs = [
  { label: 'Dashboard', icon: '📊', path: '/' },
  { label: 'Pay Now', icon: '💳', path: '/record-payment' },
  { label: 'Balances', icon: '💰', path: '/balances' },
  { label: 'Payments', icon: '📋', path: '/payments' },
  { label: 'Parents', icon: '👨‍👩‍👧', path: '/parent-subscriptions' },
  { label: 'Report', icon: '📈', path: '/report' },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {tabs.map(t => (
        <NavLink key={t.path} to={t.path} end={t.path === '/'} className="bn-tab">
          <span className="bn-icon">{t.icon}</span>
          <span className="bn-label">{t.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
