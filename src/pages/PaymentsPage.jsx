import { useState, useEffect } from 'react';
import { getPayments, reversePayment } from '../utils/api';

export default function PaymentsPage({ user }) {
  const schoolId = user?.school_id;
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ method: '', search: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = () => {
    if (!schoolId) return;
    setLoading(true);
    const params = { page, limit: 50 };
    if (filters.method) params.method = filters.method;
    if (filters.search) params.search = filters.search;
    getPayments(schoolId, params).then(d => {
      setPayments(d.payments || []);
      setTotalPages(Math.ceil((d.total || 0) / 50));
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [schoolId, page]);
  useEffect(() => { setPage(1); }, [filters]);

  const handleReverse = async (ref) => {
    if (!window.confirm('Reverse this payment?')) return;
    try {
      await reversePayment({ transaction_reference: ref, reversed_by: user?.email || 'admin' });
      load();
    } catch (err) { alert(err.message); }
  };

  return (
    <div className="page">
      <h2>Payment History</h2>
      <div className="filters">
        <select value={filters.method} onChange={e => setFilters({ ...filters, method: e.target.value })}>
          <option value="">All Methods</option>
          <option>Cash</option>
          <option>Bank Transfer</option>
          <option>Cheque</option>
          <option>M-Pesa</option>
        </select>
        <input type="text" placeholder="Search reference or student…" value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} />
      </div>
      {loading ? <p>Loading…</p> : (
        <>
          <table className="table">
            <thead>
              <tr><th>Ref</th><th>Student</th><th>Amount</th><th>Method</th><th>Date</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id} className={p.reversed_at ? 'reversed' : ''}>
                  <td>{p.transaction_reference}</td>
                  <td>{p.student_name || p.parent_phone || '-'}</td>
                  <td>KSh {p.amount?.toLocaleString()}</td>
                  <td>{p.payment_method}</td>
                  <td>{p.logged_at ? new Date(p.logged_at).toLocaleDateString() : '-'}</td>
                  <td>{p.reversed_at ? 'Reversed' : 'Active'}</td>
                  <td>
                    {!p.reversed_at && (
                      <button className="btn-small btn-danger" onClick={() => handleReverse(p.transaction_reference)}>Reverse</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pagination">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</button>
            <span>{page} / {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
          </div>
        </>
      )}
    </div>
  );
}
