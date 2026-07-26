import { useState, useEffect } from 'react';
import { getDashboard } from '../utils/api';

export default function DashboardPage({ user }) {
  const schoolId = user?.school_id;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!schoolId) return;
    getDashboard(schoolId).then(setData).catch(console.error).finally(() => setLoading(false));
  }, [schoolId]);

  if (loading) return <div className="page"><p>Loading dashboard…</p></div>;

  return (
    <div className="page">
      <h2>Fee Collection Dashboard</h2>
      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-value">KSh {data?.total_paid?.toLocaleString() || 0}</span>
          <span className="kpi-label">Total Collected</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-value">{data?.collection_rate?.toFixed(1) || 0}%</span>
          <span className="kpi-label">Collection Rate</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-value">{data?.today?.count || 0}</span>
          <span className="kpi-label">Today's Payments</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-value">KSh {data?.today?.total?.toLocaleString() || 0}</span>
          <span className="kpi-label">Today's Amount</span>
        </div>
      </div>

      <h3>Payment Method Breakdown</h3>
      <div className="method-breakdown">
        {data?.method_breakdown?.map(m => (
          <div key={m.payment_method} className="method-row">
            <span className="method-name">{m.payment_method}</span>
            <span className="method-count">{m.count} txns</span>
            <span className="method-amount">KSh {m.total?.toLocaleString()}</span>
          </div>
        ))}
      </div>

      <h3>Recent Payments</h3>
      <div className="recent-list">
        {data?.recent_payments?.map(p => (
          <div key={p.id} className="recent-row">
            <span className="recent-student">{p.student_name || p.parent_phone}</span>
            <span className="recent-amount">KSh {p.amount}</span>
            <span className="recent-method">{p.payment_method}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
