import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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

function AppLayout() {
  const location = useLocation();
  const hideNav = location.pathname === '/' || location.pathname.includes('/login');
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/record-payment" element={<RecordPaymentPage />} />
        <Route path="/balances" element={<StudentBalancesPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/statement" element={<AccountStatementPage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/parent-subscriptions" element={<ParentSubscriptionsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      {!hideNav && <BottomNav />}
    </>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    const u = sessionStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  });

  useEffect(() => {
    const handler = () => {
      const u = sessionStorage.getItem('user');
      setUser(u ? JSON.parse(u) : null);
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  if (!user) {
    return (
      <HashRouter>
        <Routes>
          <Route path="*" element={<LoginPage onLogin={(u) => { setUser(u); sessionStorage.setItem('user', JSON.stringify(u)); }} />} />
        </Routes>
      </HashRouter>
    );
  }

  return <AppLayout />;
}