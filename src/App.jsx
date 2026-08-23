import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import RecordPaymentPage from './pages/RecordPaymentPage.jsx';
import StudentBalancesPage from './pages/StudentBalancesPage.jsx';
import PaymentsPage from './pages/PaymentsPage.jsx';
import AccountStatementPage from './pages/AccountStatementPage.jsx';
import ReportPage from './pages/ReportPage.jsx';
import ParentSubscriptionsPage from './pages/ParentSubscriptionsPage.jsx';
import BottomNav from './components/BottomNav.jsx';
import './styles/app.css';

function readUser() {
  const blob = sessionStorage.getItem('user');
  if (blob) {
    try { return JSON.parse(blob); } catch (e) { /* ignore */ }
  }
  const sessionId = sessionStorage.getItem('session_id');
  const schoolId = sessionStorage.getItem('school_id');
  if (sessionId && schoolId) {
    return {
      session_id: sessionId,
      teacher_id: sessionStorage.getItem('teacher_id'),
      school_id: schoolId,
      role: sessionStorage.getItem('role') || 'teacher',
    };
  }
  return null;
}

function AppLayout({ user, onLogin }) {
  const location = useLocation();
  const hideNav = location.pathname.includes('/login') || location.pathname === '/';
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginPage onLogin={onLogin} />} />
        <Route path="/dashboard" element={<DashboardPage user={user} />} />
        <Route path="/record-payment" element={<RecordPaymentPage user={user} />} />
        <Route path="/balances" element={<StudentBalancesPage user={user} />} />
        <Route path="/payments" element={<PaymentsPage user={user} />} />
        <Route path="/statement" element={<AccountStatementPage user={user} />} />
        <Route path="/report" element={<ReportPage user={user} />} />
        <Route path="/parent-subscriptions" element={<ParentSubscriptionsPage user={user} />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      {!hideNav && <BottomNav />}
    </>
  );
}

export default function App() {
  const [user, setUser] = useState(readUser);

  useEffect(() => {
    const handler = () => setUser(readUser());
    window.addEventListener('storage', handler);
    window.addEventListener('auth-changed', handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('auth-changed', handler);
    };
  }, []);

  function handleLogin(u) {
    sessionStorage.setItem('user', JSON.stringify(u));
    sessionStorage.setItem('session_id', u.session_id || '');
    sessionStorage.setItem('teacher_id', u.teacher_id || '');
    sessionStorage.setItem('school_id', u.school_id || '');
    sessionStorage.setItem('role', u.role || 'teacher');
    setUser(u);
  }

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage onLogin={handleLogin} />} />
      </Routes>
    );
  }

  return <AppLayout user={user} onLogin={handleLogin} />;
}
