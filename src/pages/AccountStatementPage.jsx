import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getStatement } from '../utils/api';

export default function AccountStatementPage() {
  const [sp] = useSearchParams();
  const studentId = sp.get('student_id');
  const [term, setTerm] = useState(sp.get('term') || 'Term 1');
  const [year, setYear] = useState(sp.get('year') || String(new Date().getFullYear()));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    getStatement(studentId, term, year).then(setData).catch(console.error).finally(() => setLoading(false));
  }, [studentId, term, year]);

  if (!studentId) return <div className="page"><p>Select a student from Balances page.</p></div>;

  return (
    <div className="page">
      <h2>Account Statement</h2>
      <p><strong>Student:</strong> {data?.student?.full_name} ({studentId})</p>
      <div className="filters">
        <select value={term} onChange={e => setTerm(e.target.value)}>
          <option>Term 1</option><option>Term 2</option><option>Term 3</option>
        </select>
        <input type="number" value={year} onChange={e => setYear(e.target.value)} style={{ width: 80 }} />
      </div>

      {loading ? <p>Loading…</p> : data && (
        <>
          <h3>Fee Breakdown</h3>
          <table className="table">
            <thead>
              <tr><th>Fee Item</th><th>Amount (KSh)</th><th>Waived</th></tr>
            </thead>
            <tbody>
              {data.fee_items?.map((f, i) => (
                <tr key={i}>
                  <td>{f.fee_name}</td>
                  <td>{f.effective_amount}</td>
                  <td>{f.waived ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr><td><strong>Total Due</strong></td><td><strong>{data.summary?.total_due}</strong></td><td></td></tr>
            </tfoot>
          </table>

          <h3>Transaction History</h3>
          <table className="table">
            <thead>
              <tr><th>Date</th><th>Ref</th><th>Method</th><th>Amount (KSh)</th><th>Status</th></tr>
            </thead>
            <tbody>
              {data.transactions?.map(t => (
                <tr key={t.id} className={t.reversed_at ? 'reversed' : ''}>
                  <td>{t.logged_at ? new Date(t.logged_at).toLocaleDateString() : '-'}</td>
                  <td>{t.transaction_reference}</td>
                  <td>{t.payment_method}</td>
                  <td>{t.amount}</td>
                  <td>{t.reversed_at ? 'Reversed' : 'Active'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr><td colSpan={3}><strong>Total Paid</strong></td><td><strong>{data.summary?.total_paid}</strong></td><td></td></tr>
            </tfoot>
          </table>

          <div className="statement-summary">
            <p>Balance: <strong style={{ color: data.summary?.balance > 0 ? '#d32f2f' : '#2e7d32' }}>
              KSh {data.summary?.balance}
            </strong> ({data.summary?.payment_status})</p>
          </div>
        </>
      )}
    </div>
  );
}
