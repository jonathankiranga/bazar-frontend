import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import RecordPaymentPage from './pages/RecordPaymentPage';
import StudentBalancesPage from './pages/StudentBalancesPage';
import PaymentsPage from './pages/PaymentsPage';
import AccountStatementPage from './pages/AccountStatementPage';
import ReportPage from './pages/ReportPage';
import BottomNav from './components/BottomNav';
import './App.css';

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
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<LoginPage onLogin={(u) => { setUser(u); sessionStorage.setItem('user', JSON.stringify(u)); }} />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <div className="app-layout">
        <div className="app-content" style={{ paddingBottom: 70 }}>
          <Routes>
            <Route path="/" element={<DashboardPage user={user} />} />
            <Route path="/record-payment" element={<RecordPaymentPage user={user} />} />
            <Route path="/balances" element={<StudentBalancesPage user={user} />} />
            <Route path="/payments" element={<PaymentsPage user={user} />} />
            <Route path="/statement" element={<AccountStatementPage />} />
            <Route path="/report" element={<ReportPage user={user} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}
